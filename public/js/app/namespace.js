if (typeof FLIXBUD == "undefined" || !FLIXBUD) { var FLIXBUD = {}; }

FLIXBUD.namespace = function( ns, object ) {
    var pkg = window.FLIXBUD;
    var cPkg = null;
    var pkgs = ns.split('.');

    // Initial "netflix" is implied.
    if(pkgs[0] === 'FLIXBUD') { pkgs.shift(); }

    var len = pkgs.length;
    for ( var i = 0; i < len; ++i ) {
        cPkg = pkgs[i].toString();
        if ( !! cPkg ) {
            pkg = pkg[cPkg] = pkg[cPkg] || {};
        }
    }
    return pkg;
};
