$(document).ready (function () {

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var container;
    var camera, cameraTarget, scene, renderer;
    var ifc, ori_ifc;
    var loader, gmat;
    var controls;

    init();
    animate();

    function init() {

        container = document.getElementById( 'ifc-renderer' );

        camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 15 );
        camera.position.set( 3, 0.5, 3 );

        cameraTarget = new THREE.Vector3( 0, 0, 0 );

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x72645b, 2, 15 );


        loader = new THREE.AssimpJSONLoader ();
        var shading = THREE.SmoothShading;

        loader.load( './viewer/objects/models/AC11.json', function ( object ) {

            ifc = object;
            ori_ifc = cloneObject(object);
            ifc.scale.multiplyScalar( 0.1 );
            ifc.scale.set(0.03, 0.03, 0.03);
            ifc.position.set( 0, 0, 0 );
            scene.add( ifc );

        } );

        // Lights

        scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );

        addShadowedLight( 1, 1, 1, 0xffffff, 0.7 );
        //addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );
        addShadowedLight( 0.5, 1, -1, 0xdddddd, 1 );

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setClearColor( scene.fog.color );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer_width = window.innerWidth;
        renderer_height = window.innerHeight;
        renderer.setSize( renderer_width, renderer_height );

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.cullFace = THREE.CullFaceBack;

        container.appendChild( renderer.domElement );

        // controls

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        window.addEventListener( 'resize', onWindowResize, false );

        var tree_nodes = {};
        $.getJSON("./viewer/objects/models/AC11_tree.json", function(json) {
            $('#tree-renderer').tree({
                data: [json]
            });
        });
    }

    $('#tree-renderer').bind('tree.click', function (event) {
        var node = event.node;
        var name = node.name;
        var model;

        ifc.traverse(function (object) {
            object.visible = true;
        });

        if (name == 'IfcSite_Gelaende0815_1b0aQcLSb6KP4cEKR_kZZp') {
            ifc.traverse(function (object) {
                object.visible = true;
            });
        } else {
            scene.traverse(function(node) {
                if (node instanceof THREE.Object3D) {

                    if (node.name == name) {
                        console.log(node);
                        node.traverse(function (object) {
                            object.visible = false;
                            if (object instanceof THREE.Mesh) {
                                object.material.transparent = true;
                                object.material.opacity = 1;
                            }
                        });
                    } else {
                        node.traverse(function (object) {
                            if (object instanceof THREE.Mesh) {
                                object.material.transparent = true;
                            }
                        });
                    }
                } else {
                    node.material.opacity = 0;
                }
            });
        }
    });

    function cloneObject (obj) {

        var clone = Object.create(Object.getPrototypeOf(obj));

        var i, keys = Object.getOwnPropertyNames(obj);

        for (i = 0; i < keys.length; i++) {

            Object.defineProperty(clone, keys[i], Object.getOwnPropertyDescriptor(obj, keys[i]));

        }

        return clone;

     }

    function addShadowedLight( x, y, z, color, intensity ) {

        var directionalLight = new THREE.DirectionalLight( color, intensity );
        directionalLight.position.set( x, y, z );
        scene.add( directionalLight );

        directionalLight.castShadow = true;
        // directionalLight.shadowCameraVisible = true;

        var d = 1;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;

        directionalLight.shadowCameraNear = 1;
        directionalLight.shadowCameraFar = 4;

        directionalLight.shadowMapWidth = 1024;
        directionalLight.shadowMapHeight = 1024;

        directionalLight.shadowBias = -0.005;

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer_width = window.innerWidth;
        renderer_height = window.innerHeight;

        renderer.setSize( renderer_width, renderer_height );

    }

    function animate() {

        requestAnimationFrame( animate );

        render();

        controls.update();

    }

    function render() {

        var timer = Date.now() * 0.0005;

        camera.lookAt( cameraTarget );

        renderer.render( scene, camera );

    }

});