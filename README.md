3DGeoPrint
==========

Generate beautiful 3D models of Canadian topography!


The data files for this project can be found here:
https://www.dropbox.com/sh/9wdgc48msfttvlc/AABebySMJ695yDlwp-5XUSm9a/DB

Drop them into the files/db directory.

Branch 2.x
----------

The 2.x branch is a total rebuild of the tool with
better tooling (Bower, Grunt, Karma, etc.), and
better application structure. The Backend and
Frontend code are seperated (though still part of
the same repository). The backend is meant to serve
as a very simple RESTful API that serves the 
topographic data as JSON. The Frontend is built
around AngularJS.
