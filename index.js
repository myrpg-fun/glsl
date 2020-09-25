var gl, startTime, shaderProgram;

// helper function for loading shader sources
function loadShaderSource(gl, id, shaderType) {
    let source = document.getElementById(id).textContent;

    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS) ) {
        var info = gl.getShaderInfoLog(shader);
        console.error('Could not compile WebGL shader.\n\n', info);
    }

    return shader;
}

function onWindowResize( event ) {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    parameters.screenWidth = canvas.width;
    parameters.screenHeight = canvas.height;
    
    parameters.aspectX = canvas.width/canvas.height ;
    parameters.aspectY = 1.0 ;

    gl.viewport( 0, 0, canvas.width, canvas.height );
}

  function main(){
    // setup an OpenGL context
    var canvas = document.getElementById("canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = canvas.getContext("webgl");

    gl.getExtension('OES_standard_derivatives');
    gl.getExtension('EXT_shader_texture_lod');

    // build the vertex shader
    var vertexShader = loadShaderSource(gl, "vertex", gl.VERTEX_SHADER);
    
    // build the fragment shader
    var fragmentShader = loadShaderSource(gl, "fragment", gl.FRAGMENT_SHADER);
    
    // build a shader program from the vertex and fragment shader
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if ( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(shaderProgram);
        console.error('Could not link WebGL program.\n\n', info);
    }

    gl.useProgram(shaderProgram);
    
    // define vertex positions
    var vertexPositions = new Float32Array([
        1.0,  1.0, 0,  // a
        -1.0,  1.0, 0,  // b    b----a
        1.0, -1.0, 0,  // c    |    |
        -1.0,  1.0, 0,  // b    |    |
        -1.0, -1.0, 0,  // d    d----c
        1.0, -1.0, 0   // c
    ]);
    
    // send the vertex positions to the GPU
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);
        
    // define vertex texcoords
    var vertexTexcoords = new Float32Array([
        1.0, 0.0,   // a
        0.0, 0.0,   // b
        1.0, 1.0,   // c
        0.0, 0.0,   // b
        0.0, 1.0,   // d
        1.0, 1.0    // c
    ]);
    
    setInterval( loop, 1000 / 60 );

    // send the vertex texcoords to the GPU
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexTexcoords, gl.STATIC_DRAW);
    
    // wire up the shader program to the vertex position data
    var positionAttribute = gl.getAttribLocation(shaderProgram, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
    
    // wire up the shader program to the vertex texcoord data
    var texcoordAttribute = gl.getAttribLocation(shaderProgram, "texcoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordAttribute);
    gl.vertexAttribPointer(texcoordAttribute, 2, gl.FLOAT, false, 0, 0);

    startTime = Date.now();
}

function loop(){
    // wire up the shader program to the vertex texcoord data
    var timeLocation = gl.getUniformLocation(shaderProgram, "iTime"); 
    gl.uniform1f(timeLocation, (Date.now() - startTime)/1000.0);

    // tell the GPU to draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}