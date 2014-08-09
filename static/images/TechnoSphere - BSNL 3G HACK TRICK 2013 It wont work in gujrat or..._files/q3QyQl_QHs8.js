/*!CK:286088253!*//*1406521525,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["HTI+z"]); }

__d("HomeRHCAdsBasicRefresh",["AdsRefreshHandler","Arbiter","NavigationMessage","Run","SubscriptionsHandler","ge"],function(a,b,c,d,e,f,g,h,i,j,k,l){var m,n,o,p;function q(){m.cleanup();m=null;n.release();n=null;o=null;}function r(){var u=l(p);if(u&&o){u.appendChild(o);o=null;}}function s(u,v){o=v;m&&m.forceLoadIfEnoughTimePassed(0);}var t={init:function(u,v,w){p=u;m=new g(l(u),v,w).subscribeDefaultEventsForRefresh();n=new k();n.addSubscriptions(h.subscribe(i.NAVIGATION_BEGIN,q),h.subscribe('ProfileQuestionAnswered',s),h.subscribe('AdsRefreshHandler/AdsLoaded',r));j.onLeave(q);}};e.exports=t;},null);
__d("GroupsMemberCountUpdater",["Arbiter","DOM"],function(a,b,c,d,e,f,g,h){function i(){}i.subscribeMemberCount=function(j){g.subscribe('GroupsMemberCount/changeText',function(k,l){h.setContent(j,l);});};i.subscribeNewMemberCount=function(j){g.subscribe('GroupsMemberCount/changeNewMembersText',function(k,l){h.setContent(j,l);});};e.exports=i;},null);
__d("NotificationsSelector",["Parent","submitForm","AsyncRequest"],function(a,b,c,d,e,f,g,h,i){function j(l,m,n){m.subscribe('change',function(o,p){n.value=p.value;var q=g.byTag(l,'form');q&&h(q);});}function k(l,m,n,o){m.subscribe('change',function(p,q){new i().setURI('/ajax/groups/notifications/update.php').setData({setting:q.value,group_id:o}).setMethod('POST').send();});}e.exports.bindForm=j;e.exports.updateNotif=k;},null);
__d("GroupSearchBox",["CSS","DOM","Event","Input","Parent"],function(a,b,c,d,e,f,g,h,i,j,k){var l={init:function(m,n){var o=h.find(n,'.inputtext'),p=k.byClass(o,'searchBoxToggle');i.listen(m,'click',function(){g.show(n);o.focus();p&&g.addClass(p,'searchBoxVisible');});i.listen(o,'blur',function(){if(!j.getValue(o)){g.hide(n);p&&g.removeClass(p,'searchBoxVisible');}});}};e.exports=l;},null);
__d("GroupsAddTypeaheadView",["Arbiter","ContextualTypeaheadView"],function(a,b,c,d,e,f,g,h){for(var i in h)if(h.hasOwnProperty(i))k[i]=h[i];var j=h===null?null:h.prototype;k.prototype=Object.create(j);k.prototype.constructor=k;k.__superConstructor__=h;function k(){"use strict";if(h!==null)h.apply(this,arguments);}k.prototype.select=function(l){"use strict";var m=this.results[this.index];g.inform('GroupsMemberSuggestion/remove',m.uid);if(m.is_member){this.reset();}else j.select.call(this,l);};e.exports=k;},null);
__d("GroupsAddMemberTypeahead",["Arbiter","DOM","Typeahead","copyProperties","ge"],function(a,b,c,d,e,f,g,h,i,j,k){function l(m,n){if(m&&n)this.init(m,n);}j(l.prototype,{init:function(m,n){m.subscribe('select',function(o,p){g.inform('GroupsAddMemberTypeahead/add',{gid:n,uid:p.selected.uid,name:p.selected.text,photo:p.selected.photo});var q=m.getData().getExclusions();q.push(p.selected.uid);m.getData().setExclusions(q);});g.subscribe('GroupsAddMemberTypeahead/updateGroupToken',this.resetTypeaheadCaches.bind(this));},resetTypeaheadCaches:function(m,n){var o=h.scry(k('pagelet_group_'),'.uiTypeahead:not(.uiPlacesTypeahead)');for(var p=0;p<o.length;p++){var q=i.getInstance(o[p]);if(q){var r=q.getData();r.updateToken(n.token);q.getCore().subscribe('focus',r.bootstrap.bind(r));}}}});e.exports=l;},null);
__d("legacy:GroupsAddMemberTypeahead",["GroupsAddMemberTypeahead"],function(a,b,c,d){a.GroupsAddMemberTypeahead=b('GroupsAddMemberTypeahead');},3);
__d("LitestandRHCAds",["AdsRefreshHandler","Arbiter","DOM","Event","LitestandMessages","NavigationMessage","Run","SubscriptionsHandler","csx","ge"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){var q,r,s,t,u;function v(){r&&r.forceLoadIfEnoughTimePassed(0);}function w(){var ba=i.scry(s,"._5f85 a")[0];if(ba)q.addSubscriptions(j.listen(ba,'click',v));}function x(){var ba=p(t);if(ba&&u){ba.appendChild(u);u=null;}}function y(){if(r){r.cleanup();r=null;}if(q){q.release();q=null;}u=null;}function z(ba,ca){u=ca;v();}var aa={init:function(ba,ca,da){s=p(ba);t=ba;r=new g(s,ca,da).subscribeDefaultEventsForRefresh();q=new n();q.addSubscriptions(h.subscribe(l.NAVIGATION_BEGIN,y),h.subscribe('AdsRefreshHandler/AdsLoaded',w),h.subscribe('AdsRefreshHandler/AdsLoaded',x),h.subscribe('ProfileQuestionAnswered',z));w();m.onLeave(y);}};e.exports=aa;},null);
__d("PopoverMenuDynamicIcon",["Button","CSS","DOM","DOMQuery","copyProperties","csx"],function(a,b,c,d,e,f,g,h,i,j,k,l){function m(n){"use strict";this._popoverMenu=n;}m.prototype.enable=function(){"use strict";this._setMenuSubscription=this._popoverMenu.subscribe('setMenu',this._onSetMenu.bind(this));};m.prototype.disable=function(){"use strict";this._popoverMenu.unsubscribe(this._setMenuSubscription);this._setMenuSubscription=null;this._removeChangeSubscription();};m.prototype._onSetMenu=function(){"use strict";this._removeChangeSubscription();this._menu=this._popoverMenu.getMenu();this._changeSubscription=this._menu.subscribe('change',function(n,o){var p=o.item;if(o[0])p=o[0].item;if(!p)return;var q=p.getIcon();q=q?q.cloneNode(true):null;var r=this._popoverMenu.getTriggerElem(),s=j.scry(r,"span._55pe")[0];if(s){var t=s.firstChild;if(h.hasClass(t,'img')){i.replace(t,q);}else i.prependContent(s,q);}else g.setIcon(r,q);}.bind(this));};m.prototype._removeChangeSubscription=function(){"use strict";if(this._changeSubscription){this._menu.unsubscribe(this._changeSubscription);this._changeSubscription=null;}};k(m.prototype,{_setMenuSubscription:null,_changeSubscription:null});e.exports=m;},null);
__d("DirectionalDockingElement",["ArbiterMixin","CSS","DOM","DOMDimensions","Event","Run","Style","SubscriptionsHandler","ViewportBounds","getElementPosition","mixin","queryThenMutateDOM","removeFromArray"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s){var t,u=[],v=true,w=false,x='unfixed',y='fixed_top',z='fixed_middle',aa=q(g);for(var ba in aa)if(aa.hasOwnProperty(ba))da[ba]=aa[ba];var ca=aa===null?null:aa.prototype;da.prototype=Object.create(ca);da.prototype.constructor=da;da.__superConstructor__=aa;function da(ea){"use strict";this.$DirectionalDockingElement0=ea;this.$DirectionalDockingElement1=0;if(!t){var fa=r.bind(null,function(){for(var ga=0,ha=u.length;ga<ha;ga++)u[ga].$DirectionalDockingElement2();},function(){for(var ga=0,ha=u.length;ga<ha;ga++)u[ga].$DirectionalDockingElement3();},'DirectionalDockingElement');t=new n();t.addSubscriptions(k.listen(window,'scroll',fa),k.listen(window,'resize',fa));l.onLeave(function(){while(u.length)u.pop().destroy();t.release();t=null;});}u.push(this);this.$DirectionalDockingElement4=o.getTop();this.$DirectionalDockingElement5=y;m.set(this.$DirectionalDockingElement0,'width',j.getElementDimensions(this.$DirectionalDockingElement0).width+'px');this.$DirectionalDockingElement6=i.create('div');m.set(this.$DirectionalDockingElement6,'position','relative');i.replace(this.$DirectionalDockingElement0,this.$DirectionalDockingElement6);i.appendContent(this.$DirectionalDockingElement6,this.$DirectionalDockingElement0);this.update();}da.prototype.$DirectionalDockingElement2=function(){"use strict";var ea=-p(this.$DirectionalDockingElement6).y;if(ea!==this.$DirectionalDockingElement7){this.$DirectionalDockingElement8=ea>this.$DirectionalDockingElement7?w:v;this.$DirectionalDockingElement7=ea;}this.$DirectionalDockingElement9=j.getElementDimensions(this.$DirectionalDockingElement0);this.$DirectionalDockingElementa=h.hasClass(document.documentElement,'tinyViewport');this.$DirectionalDockingElementb=document.body.scrollTop+document.documentElement.clientHeight>document.documentElement.scrollHeight;};da.prototype.$DirectionalDockingElementc=function(ea,fa){"use strict";if(this.$DirectionalDockingElementd!==ea||this.$DirectionalDockingElemente!==fa){m.apply(this.$DirectionalDockingElement0,{position:ea,top:fa+'px'});this.$DirectionalDockingElementd=ea;this.$DirectionalDockingElemente=fa;}};da.prototype.$DirectionalDockingElementf=function(){"use strict";this.$DirectionalDockingElement5=y;this.$DirectionalDockingElementc('fixed',this.$DirectionalDockingElement4);};da.prototype.$DirectionalDockingElementg=function(){"use strict";this.$DirectionalDockingElement5=z;this.$DirectionalDockingElementc('fixed',this.$DirectionalDockingElement1);};da.prototype.$DirectionalDockingElementh=function(){"use strict";this.$DirectionalDockingElement5=x;this.$DirectionalDockingElementc('absolute',this.$DirectionalDockingElementi);};da.prototype.$DirectionalDockingElement3=function(){"use strict";var ea=this.$DirectionalDockingElement9.height;if(ea!==this.$DirectionalDockingElementj){m.set(this.$DirectionalDockingElement6,'height',ea+'px');this.$DirectionalDockingElementj=ea;this.inform('changedheight');}if(this.$DirectionalDockingElement5===y){this.$DirectionalDockingElementi=this.$DirectionalDockingElement7+this.$DirectionalDockingElement4;}else if(this.$DirectionalDockingElement5===z)this.$DirectionalDockingElementi=this.$DirectionalDockingElement7+this.$DirectionalDockingElement1;if(this.$DirectionalDockingElementb)return;if(this.$DirectionalDockingElement7+this.$DirectionalDockingElement4<=0||this.$DirectionalDockingElementa){this.$DirectionalDockingElementi=0;this.$DirectionalDockingElementh();return;}if(this.$DirectionalDockingElement8===w&&this.$DirectionalDockingElement7+this.$DirectionalDockingElement1>=this.$DirectionalDockingElementi){this.$DirectionalDockingElementg();}else if(this.$DirectionalDockingElement8===v&&this.$DirectionalDockingElement7+this.$DirectionalDockingElement4<=this.$DirectionalDockingElementi){this.$DirectionalDockingElementf();}else this.$DirectionalDockingElementh();};da.prototype.update=function(){"use strict";this.$DirectionalDockingElement2();this.$DirectionalDockingElement3();};da.prototype.destroy=function(){"use strict";if(u.indexOf(this)===-1)return;s(u,this);if(this.$DirectionalDockingElement6&&this.$DirectionalDockingElement6.parentNode){i.remove(this.$DirectionalDockingElement6);this.$DirectionalDockingElement6=null;}};da.prototype.setOffset=function(ea){"use strict";this.$DirectionalDockingElement1=ea;this.update();return this;};e.exports=da;},null);
__d("DockingElement",["ArbiterMixin","CSS","DOM","DOMDimensions","Event","Run","Style","SubscriptionsHandler","getElementPosition","mixin","queryThenMutateDOM","removeFromArray"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){var s,t=[],u=p(g);for(var v in u)if(u.hasOwnProperty(v))x[v]=u[v];var w=u===null?null:u.prototype;x.prototype=Object.create(w);x.prototype.constructor=x;x.__superConstructor__=u;function x(y){"use strict";this.$DockingElement0=y;this.$DockingElement1=0;if(!t.length){var z=q.bind(null,function(){for(var aa=0,ba=t.length;aa<ba;aa++)t[aa].getRect();},function(){for(var aa=0,ba=t.length;aa<ba;aa++)t[aa].updateWithCache();},'DockingElement');s=new n();s.addSubscriptions(k.listen(window,'scroll',z),k.listen(window,'resize',z));l.onLeave(function(){while(t.length)t.pop().destroy();});}t.push(this);this.update();}x.prototype.getRect=function(){"use strict";var y=this.$DockingElement2?this.getPlaceholder():this.$DockingElement0;this.$DockingElement3=o(y);this.$DockingElement4=j.getElementDimensions(y);this.$DockingElement5=h.hasClass(document.documentElement,'tinyViewport');};x.prototype.updateWithCache=function(){"use strict";var y=this.$DockingElement1,z=this.getPlaceholder();if(!this.$DockingElement5&&this.$DockingElement3.y<=y){if(!this.$DockingElement2){if(!this.$DockingElement6){i.insertAfter(this.$DockingElement0,z);this.$DockingElement6=true;}h.addClass(this.$DockingElement0,'fixed_elem');h.show(z);this.$DockingElement2=true;}var aa;if(this.$DockingElement7!==y){aa={};aa.top=y+'px';this.$DockingElement7=y;}var ba=this.$DockingElement4.width;if(ba!==this.$DockingElement8){aa=aa||{};aa.width=ba+'px';this.$DockingElement8=ba;}aa&&m.apply(this.$DockingElement0,aa);var ca=this.$DockingElement4.height;if(ca!==this.$DockingElement9){m.set(z,'height',ca+'px');this.$DockingElement9=ca;this.inform('changedheight');}}else if(this.$DockingElement2){m.apply(this.$DockingElement0,{top:'',width:''});h.removeClass(this.$DockingElement0,'fixed_elem');h.hide(z);this.$DockingElement2=false;this.$DockingElement8=null;this.$DockingElement7=null;}};x.prototype.update=function(){"use strict";this.getRect();this.updateWithCache();};x.prototype.getPlaceholder=function(){"use strict";if(!this.$DockingElementa)this.$DockingElementa=i.create('div');return this.$DockingElementa;};x.prototype.destroy=function(){"use strict";if(t.indexOf(this)===-1)return;r(t,this);if(this.$DockingElementa&&this.$DockingElementa.parentNode){i.remove(this.$DockingElementa);this.$DockingElementa=null;}if(!t.length){s.release();s=null;}};x.prototype.setOffset=function(y){"use strict";this.$DockingElement1=y;this.update();return this;};e.exports=x;},null);
__d("StickyRHC",["Arbiter","DirectionalDockingElement","DockingElement","DOM","DOMDimensions","Event","LitestandMessages","Run","SubscriptionsHandler","ViewportBounds","$","csx","ge","getElementPosition","removeFromArray","throttle"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v){var w=[],x;function y(ca,da){if(!da||!da.dom_id){w.forEach(z);return;}var ea=q(da.dom_id);for(var fa=0;fa<w.length;fa++)if(j.contains(w[fa].getRoot(),ea)){z(w[fa]);return;}}function z(ca){var da=ca.getRoot(),ea=ca.updateOffset.bind(ca),fa=j.scry(da,'img.img');fa.forEach(function(ga){if(ga.complete||ga.getAttribute('height')||(typeof ga.naturalHeight!=='undefined'&&ga.naturalHeight!==0))return;var ha=function(){ea();ia.remove();ja.remove();ka.remove();},ia=l.listen(ga,'load',ha),ja=l.listen(ga,'error',ha),ka=l.listen(ga,'abort',ha);});ea();}function aa(){w.forEach(function(ca){ca.updateOffset();});}function ba(ca,da){"use strict";this.$StickyRHC0=ca;this.$StickyRHC1=da?new h(ca):new i(ca);this.$StickyRHC2=0;this.$StickyRHC1.subscribe('changedheight',this.updateOffset.bind(this));this.updateOffset();z(this);if(!w.length){x=new o();x.addSubscriptions(g.subscribe('header_loaded',aa),g.subscribe('netego_loaded',y),g.subscribe(m.RHC_RELOADED,function(){aa();w.forEach(z);}),l.listen(window,'resize',v(aa)));}n.onLeave(this.destroy.bind(this));w.push(this);}ba.prototype.getRoot=function(){"use strict";return this.$StickyRHC0;};ba.prototype.destroy=function(){"use strict";this.$StickyRHC1.destroy();u(w,this);if(!w.length){x.release();x=null;}};ba.prototype.updateOffset=function(){"use strict";var ca=j.scry(this.$StickyRHC0,"._4-u2"),da=j.scry(this.$StickyRHC0,"._4-u3"),ea=j.scry(this.$StickyRHC0,"._5eh2"),fa=j.scry(this.$StickyRHC0,'.uiHeader'),ga=j.scry(this.$StickyRHC0,'.ego_unit'),ha=[].concat(ca,da,ea,fa,ga),ia=[];ha.forEach(function(sa){ia.push(t(sa).y);});ia.sort(function(sa,ta){return sa-ta;});var ja=t(this.$StickyRHC0).y,ka=k.getElementDimensions(this.$StickyRHC0).height;ka+=this.$StickyRHC2;var la=p.getTop(),ma=k.getViewportDimensions().height-la;if(typeof this.$StickyRHC3==='undefined'){var na=s('pageFooter');this.$StickyRHC3=na?k.getElementDimensions(na).height:0;}ma-=this.$StickyRHC3;var oa=ma-ka;if(ka<ma){oa=la;}else for(var pa=0,qa=ia.length;pa<qa;pa++){var ra=ia[pa]-ja;if(ka-ra<ma){oa=la-ra;break;}}this.$StickyRHC1.setOffset(oa+this.$StickyRHC2);};ba.prototype.setOffset=function(ca){"use strict";this.$StickyRHC2=ca;this.updateOffset();};e.exports=ba;},null);
__d("TypeaheadSubmitOnSelect",["Form","copyProperties"],function(a,b,c,d,e,f,g,h){function i(j){"use strict";this._typeahead=j;}i.prototype.enable=function(){"use strict";this._subscription=this._typeahead.subscribe('select',function(){var j=this._typeahead.getCore().getElement().form;if(j)j.getAttribute('rel')=='async'?g.bootstrap(j):j.submit();}.bind(this));};i.prototype.disable=function(){"use strict";this._typeahead.unsubscribe(this._subscription);this._subscription=null;};h(i.prototype,{_subscription:null});e.exports=i;},null);
__d("legacy:SubmitOnSelectTypeaheadBehavior",["TypeaheadSubmitOnSelect"],function(a,b,c,d,e,f,g){if(!a.TypeaheadBehaviors)a.TypeaheadBehaviors={};a.TypeaheadBehaviors.submitOnSelect=function(h){h.enableBehavior(g);};},3);