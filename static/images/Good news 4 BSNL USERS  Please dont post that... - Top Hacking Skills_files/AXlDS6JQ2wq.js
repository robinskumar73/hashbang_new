/*!CK:1656811222!*//*1407118824,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["zqlUD"]); }

__d("DragDropLogging",["LogHistory","DOM","MercuryConfig"],function(a,b,c,d,e,f,g,h,i){function j(k,l){var m=g.getInstance(k);return function(n,event){if(i.DragDropAttachmentsGK){if(event)event={target:event.target.className,clientX:event.clientX,clientY:event.clientY,types:event.dataTransfer.types};var o={count:l.call(this),fbWantsDragDrop:h.scry(document.body,'.fbWantsDragDrop').length,fbDropReady:h.scry(document.body,'.fbDropReady').length};m.debug(n,o,event);}};}e.exports={get:j};},null);