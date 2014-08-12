/**
 * Requires: writefacets.js
 *
 * This script will populate the page with a WebGL render of
 * a map.
 */

var MapPreview = function () {
    var esri_topographic = 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        esri_satelite    = 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        esri_shaded      = 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
        tileserver = esri_satelite,
        scene = new THREE.Scene(),
        container = document.getElementById("preview"),
        camera = new THREE.PerspectiveCamera(5, container.offsetWidth / container.offsetHeight, 0.011, 10000),
        renderer = new THREE.WebGLRenderer({alpha: true}),
        alight = new THREE.AmbientLight(0x333333),
        wlight = new THREE.DirectionalLight(0xFFFFFF, 0.6),
        slight = new THREE.DirectionalLight(0xFFFFFF/*0x0055AA*/, 0.1),
        dlight = new THREE.DirectionalLight(0xFFFFFF/*0x55CC00*/, 0.4),
        canvas = document.createElement( 'canvas' ),
        dynamicTexture = new THREE.Texture(canvas),
        defaultTexture = THREE.ImageUtils.loadTexture(
            tileserver.replace('{z}', '8')
                      .replace('{y}', '93')
                      .replace('{x}', '71')
        ),
        material = new THREE.MeshPhongMaterial({ 
            map:          dynamicTexture,
            ambient:      0x999999, 
            color:        0xCCCCCC,//0x999999, 
            specular:     0x777777, 
            shininess:    10, 
            shading:      THREE.SmoothShading,
            //vertexColors: THREE.FaceColors // Colors are defined in writeFacets
        }),
        mouseDown = null,
        cube;

    canvas.width = 256;
    canvas.height = 256;
    canvas.ctx = canvas.getContext("2d");
    canvas.ctx.rotate(180 * (Math.PI/180));

    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    wlight.position.set( 0,  2, 1);
    slight.position.set(-2, -2, 2);
    dlight.position.set( 2,  1, 1);
    scene.add(wlight);
    scene.add(alight);
    scene.add(slight);
    scene.add(dlight);

    /**
     * Mouse Handlers for
     * Container
     */
    function mousemovehandler(e) {
        e.preventDefault();
        e.offsetX = e.offsetX === undefined ? e.layerX : e.offsetX;
        cube.rotation.z = mouseDown.originalZ - (mouseDown.originalX - e.offsetX) * 0.01;
    }
    document.getElementById("rotate").onmousedown = function (e) {
        e.offsetX = e.offsetX === undefined ? e.layerX : e.offsetX;
        mouseDown = {
            "originalZ": cube.rotation.z,
            "originalX": e.offsetX
        };
        window.addEventListener("mousemove", mousemovehandler);
    }
    window.addEventListener("mouseup", function (e) {
        mouseDown = null;
        window.removeEventListener("mousemove", mousemovehandler);
    });

    /**
     * @private
     * Animates objects by re-rendering them
     * on every animation frame.
     */
    function render() {
        if (cube && !mouseDown) cube.rotation.z += 0.005;

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();

    /**
     * @private
     * Generates the texture by applying an image to canvas and
     * transforming it.
     */
    function generateTexture(latLng, height) {
        var img = [],
            numberOfImages = 1,
            isCleared = false,
            ctx = canvas.ctx,
            tileSize = LeafletMap.tileLayer._getTileSize(),
            projected = LeafletMap.map.project(latLng),
            layerCoords = LeafletMap.map.latLngToLayerPoint(latLng),
            unprojected, 
            offsetCoords, 
            offset, 
            i, j,
            z, y, x;

        // Find the offset
        projected.x = projected.x - projected.x % tileSize;
        projected.y = projected.y - projected.y % tileSize;
        unprojected = LeafletMap.map.unproject(projected);
        offsetCoords = LeafletMap.map.latLngToLayerPoint(unprojected);
        offset = {
            x: layerCoords.x - offsetCoords.x,
            y: layerCoords.y - offsetCoords.y
        };

        z = LeafletMap.map.getZoom();
        y = projected.y / tileSize;
        x = projected.x / tileSize;

        numberOfImages = (height - height % tileSize) / tileSize + 1;
        for (i=0; i<=numberOfImages; i++) {
            img.push([]);
            for (j=0; j<=numberOfImages; j++) {
                img[i].push(new Image());

                img[i][j].crossOrigin = "anonymous";
                img[i][j].src = tileserver
                    .replace("{z}", z)
                    .replace("{y}", y + i)
                    .replace("{x}", x + j);
                img[i][j].onload = onload;
            }
        }
        
        function onload(e) {
            var x = 0,
                y = 0,
                scaleX = 1.35 * (tileSize / height),
                scaleY = 1 * (tileSize / height);
            if (!isCleared) {
                // The model is technically upside-down (ugh!)
                // So rotate the texture and draw it at
                // -width, -height instead of at 0,0
                ctx.clearRect(-1024, -1024, 2048, 2048);
                isCleared = true;
            }

            for (y=0; y<=numberOfImages; y++) {
                for (x=0; x<=numberOfImages; x++) {
                    if (img[y][x] === e.srcElement) break;
                }
                if (img[y][x] === e.srcElement) break;
            }

            ctx.drawImage(
                e.srcElement, 
                -tileSize - (offset.x * scaleX) + (tileSize * x * scaleX) + 10, 
                -tileSize - (offset.y * scaleY) + (tileSize * y * scaleY), 
                tileSize * scaleX, 
                tileSize * scaleY
            );
            dynamicTexture.needsUpdate = true;
        }
    }

    /**
     * @private
     * Accepts a 2D Matrix, and returns a version of it where
     * all sides are padded with 1s.
     */
    function padMatrixData(arr) {
        var x, y, blank = [];
        for (y=0; y < arr.length; y++) {
            arr[y].push(1);
            arr[y].unshift(1);
        }
        for (x=0; x < arr[0].length; x++) {
            blank.push(1);
        }

        arr.push(blank);
        arr.unshift(blank);

        return arr;
    }

    /**
     * @private
     * Generates a ThreeJS Geometry object
     * using data from a 2D Matrix.
     */
    function generateCustomGeometry(arr, scale) {
        var i;
        for (i=0; i<arr.length; i++) {
            arr[i].reverse();
        }

        var write = new WriteFacets(arr,scale),
            x, y;
        for (y=0; y < arr.length-1; y++) {
            write.east(0, y);
            write.west(arr[0].length - 1, y);
            for (x=0; x < arr[y].length-1; x++) {
                if (y==0) write.north(x, y);
                if (y==arr.length-2) write.south(x, y+1);
                write.bottom(x, y);
                write.top(x, y);
            }
        }

        write.result.computeFaceNormals();
        write.generateUVs();
        return write.result;
    }

    /**
     * @public
     * @static
     */
    return {
        loadNewMap: function (arr, scale, latLng, height) {
            scene.remove(cube);

            var mapGeometry = generateCustomGeometry(padMatrixData(arr), scale);

            generateTexture(latLng, height);
            cube = new THREE.Mesh(mapGeometry, material);
           
            camera.position.z = arr.length * 20;

            cube.position.y = -10;
            cube.scale.set(1, 1.35, 1.35);
            cube.rotation.x = -1.0;
            cube.rotation.z = 2.8;
            scene.add(cube);
        },
        createDownloadLink: function(id,x,y,w,h,s) {
            var link = document.getElementById("download-stl"),
                r = ((w - w % 200) / 200) + 1;
            link.href="php/download.php?mapId="+id+"&x="+x+"&y="+y+"&w="+w+"&h="+h+"&r="+r+"&s="+s;
            link.className = "";
        },
        createWrlLink: function(arr, scale) {
            var wrl = URL.createObjectURL(new Blob([VRML.getWrlAsString(arr, scale)], {type: "application/octet-stream"})), //"data:application/octet-stream;base64," + btoa(VRML.getWrlAsString(arr, scale)),
                texture = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),
                link = document.getElementById("download-wrl");


            link.onclick = function () {
                window.open(wrl, "_blank");
                window.open(texture, "_blank");
            }
        }
    };
};
