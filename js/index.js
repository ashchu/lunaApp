(function(angular) {
  'use strict';
  var module = angular.module('app', [
    'ngAnimate',
    'ngTouch'
  ]);
  
  module.factory('twbThrottle', ['$timeout', function($timeout) {
    return function(cb, d, nt, db) {
      var s = {};
      s.tid = undefined,
      s.ls = 0;
      
      s.w = function() {s
        s.t = this;
        s.a = arguments;
        s.e = +new Date() - s.le;
        s.ex = function() {
          s.le = +new Date();
          cb.apply(s.t, s.a);
        };
        s.cl = function() {
          s.tid = undefined;
        };
        
        if (db && !s.tid) {
          s.ex();
        }
        
        if (s.tid) {
          $timeout.cancel(s.tid);
        }
        
        if (db === undefined && s.e > d) {
          s.ex();
        } else if (nt !== true) {
          s.tid = $timeout(db ? s.cl : s.ex, db === undefined ? d - s.e : d);
        }
      };
      return s.w;
    }
  }]);
  
  module.factory('twbUa', ['$window', function($window) {
    var ua = {};
    ua.nav = $window.navigator.userAgent;
    ua.b = {
      'chrome': /chrome/i,
			'safari': /safari/i,
			'firefox': /firefox/i,
			'ie': /trident/i,
      'msie': /MSIE/i
    };
    
    for (var key in ua.b) {
      if (ua.b[key].test(ua.nav)) {
        return {
          'ua': key
        }
      }
    };
    return {
      'ua': 'unknown'
    }
  }]);
  
  module.directive('twbParallax', ['$document', '$timeout', 'twbUa', 'twbThrottle', '$log', function($document, $timeout, twbUa, twbThrottle, $log) {
    return {
      restrict: 'A',
      link: function(s, e, a) {
        s.ua = twbUa.ua,
        s.cur = 0,
        s.t = false,  
        s.sen = a['sen'],
        s.dur = a['dur'],
        s.tsn = e.children().length;  
        
        $log.debug('ua: ', s.ua);
        
        s.sTimeout = function(sDur) {
          $timeout(function() {
            s.t = false;
          }, sDur);
        };
        
        s.ni = function() {
          var ns = e.children().eq(s.cur - 1);
          ns.css('transform', 'translate3d(0px,-130vh,0px)').find('div').css('transform', 'translateY(40vh)');
          s.cst();
          twbThrottle(ns.css('z-index', '-1'), 80);
        };
        
        s.pi = function() {
          var ps = e.children().eq(s.cur + 1);
          ps.css('transform', 'translate3d(0px,30vh,0px)').find('div').css('transform', 'translateY(30vh)');
          s.cst();
          twbThrottle(ps.css('z-index', '-1'), 80);
        };
        
        s.cst = function() {
          var cs = e.children().eq(s.cur);
          
          cs.css('transform', 'translate3d(0px,-15vh,0px)').find('div').css('transform', 'translateY(15vh)');
          twbThrottle(cs.css('z-index', '1'), 100);
        }
        
        s.ps = function(evnt) {
          if (s.ua === 'firefox') {
            s.d = evnt.originalEvent.detail * (-120);
          } else if (s.ua === 'safari') {
            s.d = (evnt.originalEvent.pageY > 0) ? -(evnt.originalEvent.pageY * (120)) : -120; 
          } else if (s.ua === 'ie' || s.ua === 'msie') {
            s.d = -evnt.originalEvent.deltaY;
          } else {
            s.d = evnt.originalEvent.wheelDelta;
          }
          
          $log.debug(s.d, s.sen, s.cur, s.tsn - 1);
          
          if (s.t !== true) {
            if (s.d <= -s.sen) {
              s.t = true;
              if (s.cur !== s.tsn - 1) {
                s.cur++;
                s.ni(s.cur);
              }
              s.sTimeout(s.dur);
            }
            if (s.d >= s.sen) {
              s.t = true;
              if (s.cur !== 0) {
                s.cur--;
              }
              s.pi(s.cur);
              s.sTimeout(s.dur);
            }
          }
        };
        
        s.e = "DOMMouseScroll mousewheel onmousewheel touchend"; // Firefox: DOMMouseScroll, Chrome:mousewheel, IE: onmousewheel
        
        $log.debug('event: ', s.e);
        
        e.on(s.e, function(event) {
          $log.debug('Event: ', event);
          $document.on(s.e, twbThrottle(s.ps, 60));
        });
        
        e.on('$destroy', function() {
          $document.off(s.e, s.ps);
        });
      }
    }
  }]);
  
})(window.angular);