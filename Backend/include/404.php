<?php

/**
 * Set the Header to 404, Not Found
 * and display a 404 message.
 */

header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
?><html>
    <head>
        <title>404</title>
    </head>
    <body>
        <center>
            <h1>404 - Not Found</h1>
            <p>Oops! It looks like the resource you're looking for doesn't exist.</p>
        </center>
    </body>
</html><?php

exit;
