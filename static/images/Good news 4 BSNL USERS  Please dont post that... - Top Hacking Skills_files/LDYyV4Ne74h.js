/*!CK:1538915177!*//*1407121638,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["lutqw"]); }

__d("CommunityNotificationFilter",[],function(a,b,c,d,e,f){e.exports={ALL:0,WORK:1,SOCIAL:2};},null);
__d("NotificationConstants",[],function(a,b,c,d,e,f){e.exports={PayloadSourceType:{UNKNOWN:0,USER_ACTION:1,LIVE_SEND:2,ENDPOINT:3,INITIAL_LOAD:4,OTHER_APPLICATION:5}};},null);
__d("NotificationTokens",["CurrentUser"],function(a,b,c,d,e,f,g){var h={tokenizeIDs:function(i){return i.map(function(j){return g.getID()+':'+j;});},untokenizeIDs:function(i){return i.map(function(j){return j.split(':')[1];});}};e.exports=h;},null);
__d("NotificationUpdates",["Arbiter","ChannelConstants","JSLogger","NotificationConstants","NotificationTokens","LiveTimer","copyProperties","createObjectFrom"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n){var o={},p={},q={},r={},s=[],t=0,u=i.create('notification_updates');function v(){if(t)return;var z=o,aa=p,ba=q,ca=r;o={};p={};q={};r={};x('notifications-updated',z);if(Object.keys(aa).length)x('seen-state-updated',aa);if(Object.keys(ba).length)x('read-state-updated',ba);if(Object.keys(ca).length)x('hidden-state-updated',ca);s.pop();}function w(){if(s.length)return s[s.length-1];return j.PayloadSourceType.UNKNOWN;}function x(event,z){y.inform(event,{updates:z,source:w()});}g.subscribe(h.getArbiterType('notification_json'),function(z,aa){var ba=Date.now(),ca=aa.obj.nodes;if(ca){ca.forEach(function(da){da.receivedTime=ba;});u.debug('notifications_received',ca);y.handleUpdate(j.PayloadSourceType.LIVE_SEND,aa.obj);}});g.subscribe(h.getArbiterType('notifications_seen'),function(z,aa){var ba=k.tokenizeIDs(aa.obj.alert_ids);y.handleUpdate(j.PayloadSourceType.LIVE_SEND,{seenState:n(ba)});});g.subscribe(h.getArbiterType('notifications_read'),function(z,aa){var ba=k.tokenizeIDs(aa.obj.alert_ids);y.handleUpdate(j.PayloadSourceType.LIVE_SEND,{readState:n(ba)});});var y=m(new g(),{handleUpdate:function(z,aa){if(aa.servertime)l.restart(aa.servertime);if(Object.keys(aa).length)this.synchronizeInforms(function(){s.push(z);var ba=m({payloadsource:w()},aa);this.inform('update-notifications',ba);this.inform('update-seen',ba);this.inform('update-read',ba);this.inform('update-hidden',ba);}.bind(this));},didUpdateNotifications:function(z){m(o,n(z));v();},didUpdateSeenState:function(z){m(p,n(z));v();},didUpdateReadState:function(z){m(q,n(z));v();},didUpdateHiddenState:function(z){m(r,n(z));v();},synchronizeInforms:function(z){t++;try{z();}catch(aa){throw aa;}finally{t--;v();}}});e.exports=y;},null);
__d("NotificationSeenState",["NotificationConstants","NotificationUpdates","copyProperties","createObjectFrom","mergeObjects"],function(a,b,c,d,e,f,g,h,i,j,k){var l={},m=1,n=2,o=0,p=m,q=m|n,r=g.PayloadSourceType.INITIAL_LOAD,s={UNSEEN_AND_UNREAD:o,SEEN_BUT_UNREAD:p,SEEN_AND_READ:q};function t(v){var w=[],x=[];Object.keys(v).forEach(function(y){var z=v[y],aa=l[y];l[y]=z;if(aa===undefined){w.push(y);x.push(y);return;}var ba=aa^z;if(ba&m)w.push(y);if(ba&n)x.push(y);});w.length&&h.didUpdateSeenState(w);x.length&&h.didUpdateReadState(x);}h.subscribe('update-notifications',function(v,w){var x=w.nodes;if(!x||!x.length)return;var y=w.payloadsource,z=g.PayloadSourceType,aa=y==z.ENDPOINT,ba={};w.nodes.forEach(function(ca){var da=ca.alert_id;if(!aa||l[da]===undefined)ba[da]=s[ca.seen_state];});t(ba);});h.subscribe('update-seen',function(v,w){if(!w.seenState)return;var x=[],y={};Object.keys(w.seenState).forEach(function(aa){if(!w.seenState[aa]){x.push(aa);return;}var ba=l[aa];if(ba!==undefined)y[aa]=ba|m;});var z=k(j(x,o),y);t(z);});h.subscribe('update-read',function(v,w){if(!w.readState)return;var x=[],y={};Object.keys(w.readState).forEach(function(aa){if(w.readState[aa]){x.push(aa);return;}var ba=l[aa];if(ba!==undefined){y[aa]=ba&~n;}else if(w.payloadsource==r)y[aa]=p;});var z=k(j(x,q),y);t(z);});var u={isRead:function(v){var w=l[v];return w==q;},getUnseenCount:function(){return u.getUnseenIDs().length;},getUnseenIDs:function(){return Object.keys(l).filter(function(v){return l[v]==o;});},getUnreadCount:function(){return u.getUnreadIDs().length;},getUnreadIDs:function(){return Object.keys(l).filter(function(v){return l[v]!=q;});}};e.exports=u;},null);
__d("NotificationStore",["CommunityNotificationFilter","KeyedCallbackManager","NotificationConstants","NotificationUpdates","RangedCallbackManager","MercuryServerDispatcher"],function(a,b,c,d,e,f,g,h,i,j,k,l){var m=new h(),n=new k(function(r){var s=m.getResource(r);return s.creation_time;},function(r,s){return s-r;}),o={},p=null;j.subscribe('update-notifications',function(r,s){if(s.page_info)o[s.filter]=s.page_info;if(s.nodes===undefined)return;var t,u=[],v={},w=s.nodes||[],x;w.forEach(function(y){t=y.alert_id;x=m.getResource(t);if(!x||x.creation_time<y.creation_time){u.push(t);v[t]=y;}});m.addResourcesAndExecute(v);n.addResources(u);j.didUpdateNotifications(u);});l.registerEndpoints({'/ajax/notifications/client/get.php':{mode:l.IMMEDIATE,handler:function(r){j.handleUpdate(i.PayloadSourceType.ENDPOINT,r);}}});var q={getNotifications:function(r,s,t){var u=false,v=null;if(s!==g.ALL){var w=s===g.WORK;u=true;v=function(ea){var fa=m.getResource(ea);return fa.isCommunity===w;};}var x=n.executeOrEnqueue(0,r,function(ea){var fa=m.executeOrEnqueue(ea,function(ga){t(ga,s);});},u,v),y=n.getUnavailableResources(x);if(y.length){n.unsubscribe(x);if(!q.canFetchMore(s)){m.executeOrEnqueue(n.getAllResources(),function(ea){t(ea,s);});return;}var z=o[s],aa=(z&&z.end_cursor)||null,ba;if(aa){var ca=Math.max.apply(null,y),da=n.getCurrentArraySize({strict:u,skipOnStrictHandler:v});ba=ca-da+1;}else ba=r;l.trySend('/ajax/notifications/client/get.php',{businessID:p,cursor:aa,length:ba,filter:s});}},filterNotification:function(r,s){if(!r){return false;}else if(s===g.WORK){return !!r.isCommunity;}else if(s===g.SOCIAL)return !r.isCommunity;return true;},getFilteredIDs:function(r,s){return r.filter(function(t){return s(m.getResource(t));});},getAll:function(r){q.getNotifications(q.getCount(null),g.ALL,r);},getCount:function(r){return n.getAllResources().filter(function(s){return !r||r(m.getResource(s));}).length;},canFetchMore:function(r){var s=o[r];return (!s||!s.hasOwnProperty('has_next_page')||s.has_next_page);},setBusinessID:function(r){p=r;}};e.exports=q;},null);
__d("NotificationInitialLoadController",["Arbiter","NotificationConstants","NotificationUpdates","NotificationSeenState","NotificationStore"],function(a,b,c,d,e,f,g,h,i){b('NotificationSeenState');b('NotificationStore');function j(k){i.handleUpdate(h.PayloadSourceType.INITIAL_LOAD,k);g.inform('jewel/count-updated',{jewel:k.isCommunity?'community-notifications':'notifications',count:k.nodes.length});}e.exports=j;},null);
__d("NotificationPhotoThumbnail",[],function(a,b,c,d,e,f){function g(i){if(!i.media||!i.style_list||!i.style_list.length)return null;switch(i.style_list[0]){case 'album':case 'application':case 'photo':case 'video':case 'video_autoplay':case 'video_inline':return i.media.image;default:return null;}}var h={getThumbnail:function(i,j,k){var l;if(i&&i.length){l=g(i[0]);if(l)return l;}if(k){var m=k.relevant_comments;if(m&&m.length){var n=m[0].attachments;if(n&&n.length){l=g(n[0]);if(l)return l;}}}if(j){var o=j.attachments;if(o&&o.length)return g(o[0]);}return null;}};e.exports=h;},null);
__d("NotificationURI",["URI","isFacebookURI"],function(a,b,c,d,e,f,g,h){var i={localize:function(j){j=g(j);if(!h(j))return j.toString();var k=j.getSubdomain();return j.getUnqualifiedURI().getQualifiedURI().setSubdomain(k).toString();},snowliftable:function(j){if(!j)return false;j=g(j);var k=j.getQueryData();return h(j)&&('fbid' in k||'v' in k);},isVaultSetURI:function(j){if(!j)return false;j=g(j);return h(j)&&j.getPath()=='/ajax/vault/sharer_preview.php';}};e.exports=i;},null);
__d("NotificationUserActions",["AsyncRequest","AsyncSignal","NotificationConstants","NotificationStore","NotificationTokens","NotificationUpdates","URI","createObjectFrom","emptyFunction","mergeInto"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){var q=i.PayloadSourceType.USER_ACTION,r='mark_spam',s='turn_off',t='undo',u='original_subscription_level',v='first_receipt_yes',w='first_receipt_no';function x(ca){var da=m('/ajax/notifications/mark_read.php').getQualifiedURI().toString();new h(da,ca).send();}function y(ca){var da={};ca.forEach(function(ea,fa){da['alert_ids['+fa+']']=ea;});return da;}function z(ca,da,ea,fa,ga){var ha=k.untokenizeIDs([ca])[0],ia={notification_id:ha,client_rendered:true,request_type:da};p(ia,ea);new g('/ajax/notifications/negative_req.php').setData(ia).setHandler(fa||o).setErrorHandler(ga||o).send();}function aa(ca,da,ea,fa,ga){var ha=ga?t:s;j.getAll(function(ia){var ja=Object.keys(ia).filter(function(ka){var la=ia[ka];return !!(la.application&&la.application.id&&la.application.id==da);});z(ca,ha,null,function(ka){ea(ka);l.handleUpdate(q,{hiddenState:n(ja,!ga)});},fa);});}var ba={markNotificationsAsSeen:function(ca){l.handleUpdate(q,{seenState:n(ca)});var da=k.untokenizeIDs(ca),ea=y(da);ea.seen=true;x(ea);if(a.presenceNotifications)a.presenceNotifications.alertList.markSeen(da);},markNotificationsAsRead:function(ca){l.handleUpdate(q,{readState:n(ca)});var da=k.untokenizeIDs(ca);x(y(da));if(a.presenceNotifications)a.presenceNotifications.markRead(false,da);},markNotificationAsHidden:function(ca,da,ea){l.handleUpdate(q,{hiddenState:n([ca])});z(ca,s,null,da,ea);},markNotificationAsVisible:function(ca,da,ea,fa){l.handleUpdate(q,{hiddenState:n([ca],false)});var ga=null;if(da!==null){ga={};ga[u]=da;}z(ca,t,ga,ea,fa);},markNotificationAsSpam:function(ca,da,ea){l.handleUpdate(q,{hiddenState:n([ca],false)});z(ca,r,null,da,ea);},markAppAsHidden:function(ca,da,ea,fa){var ga=false;aa(ca,da,ea,fa,ga);},markAppAsVisible:function(ca,da,ea,fa){var ga=true;aa(ca,da,ea,fa,ga);},markFirstReceiptYes:function(ca,da,ea){z(ca,v,null,da,ea);},markFirstReceiptNo:function(ca,da,ea){z(ca,w,null,da,ea);}};e.exports=ba;},null);
__d("MusicButtonStore",[],function(a,b,c,d,e,f){var g={},h={addButton:function(i,j){g[i]=j;return j;},getButton:function(i){return g[i];},getButtons:function(){return g;},removeButton:function(i){g[i]&&g[i].resetLoadingTimers();delete g[i];}};e.exports=h;},null);
__d("MusicConstants",["URI"],function(a,b,c,d,e,f,g){var h={DEBUG:false,CONFIG:{PARTNER_TIMEOUT:8000},LIVE_LISTEN_MIN_SPOTIFY_VERSION:'spotify-0.6.6.0.g5a9eaca5',enableDebug:function(){this.DEBUG=true;},sameURLs:function(i,j){var k=/\/$/;if(i&&j){i=g(i);j=g(j);return i.getDomain()==j.getDomain()&&i.getPath()==j.getPath();}return false;},greaterOrEqualToMinimumVersion:function(i,j){var k=/(?:\d+\.)+/,l=i.match(k)[0].split('.').slice(0,-1),m=j.match(k)[0].split('.').slice(0,-1);if(l.length!==m.length)return false;for(var n=0;n<m.length;n++)if(+l[n]<+m[n]){return false;}else if(+l[n]>+m[n])return true;return true;},sanitizeForProviders:function(i){var j={};for(var k in i)if(this.ALLOWED_EXTERNAL_CONTEXT_PARAMS[k])j[k]=i[k];return j;},OP:{RESUME:'RESUME',PAUSE:'PAUSE',PLAY:'PLAY',VERSION:'VERSION'},STATUS_CHANGE_OP:{STATUS:'STATUS',LOGIN:'LOGIN',REINFORM:'REINFORM'},STATUS_CHANGE_EVENT:{playing:'PLAY_STATE_CHANGED',track:'TRACK_CHANGED'},DIAGNOSTIC_EVENT:{ALL_PAUSED:'ALL_PAUSED',ALL_OFFLINE:'ALL_OFFLINE',OFFLINE:'OFFLINE',ONLINE:'ONLINE',SEARCHING:'SEARCHING',HIT:'HIT',MISS:'MISS',RESIGN:'RESIGN',IFRAME_POLLING:'IFRAME_POLLING',RELAUNCH:'RELAUNCH',STATE_CHANGE:'STATE_CHANGE',WRONG_VERSION:'WRONG_VERSION',SERVICE_ERROR:'SERVICE_ERROR',INCORRECT_ONLINE_STATE:'INCORRECT_ONLINE_STATE',LOG_SEND_OP:'LOG_SEND_OP',REQUEUE_OP:'REQUEUE_OP'},ALLOWED_STATUS_PARAMS:{playing:'playing',track:'track',context:'context',client_version:'client_version',start_time:'start_time',expires_in:'expires_in',open_graph_state:'open_graph_state'},ALLOWED_EXTERNAL_CONTEXT_PARAMS:{uri:true,song:true,radio_station:true,album:true,playlist:true,musician:true,song_list:true,offset:true,title:true,request_id:true,listen_with_friends:true,needs_tos:true},LIVE_LISTEN_OP:{NOW_LEADING:'NOW_LEADING',NOW_LISTENING:'NOW_LISTENING',END_SESSION:'END_SESSION',SONG_PLAYING:'SONG_PLAYING',LISTENER_UPDATE:'LISTENER_UPDATE',QUEUE_SESSION:'QUEUE_SESSION',PLAY_ERROR:'PLAY_ERROR',SESSION_UPDATED:'SESSION_UPDATED',QUEUING_SESSION:'QUEUING_SESSION'},MUSIC_BUTTON:{ACTIVATE:'ACTIVATE'},ERROR:{1:'SERVICE_UNAVAILABLE_WITHOUT_PREMIUM',2:'SERVICE_UNAVAILABLE_WITHOUT_PREMIUM_OR_WAIT',3:'SERVICE_UNAVAILABLE_BILLING_ISSUE',4:'SERVICE_UNAVAILABLE_TECHNICAL_ISSUE',5:'AUDIO_AD_PLAYING',99:'SERVICE_TEMPORARILY_UNAVAILABLE',101:'SONG_UNAVAILABLE_WITHOUT_PURCHASE',102:'SONG_UNAVAILABLE_WITHOUT_PREMIUM',103:'SONG_UNAVAILABLE_INDEFINITELY'}};e.exports=a.MusicConstants||h;},null);
__d("MusicEvents",["Arbiter"],function(a,b,c,d,e,f,g){e.exports=a.MusicEvents=new g();},null);
__d("MusicButton",["BanzaiODS","Bootloader","copyProperties","CSS","DOM","MusicButtonStore","MusicConstants","MusicEvents","Parent","BanzaiScuba","Tooltip","cx","setTimeoutAcrossTransitions"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s){var t=function(u,v,w,x,y,z){this.provider=u;this.buttonElem=v;this.url=w;this.context=x||{};this.mediaType=y;this.setState(this.STATES.OFFLINE);this.tooltip=z||'';n.subscribe(m.MUSIC_BUTTON.ACTIVATE,this.processClick.bind(this));};i(t,{tracksetableTypes:[]});i(t.prototype,{SHOW_LOADING_TIMEOUT:500,HIDE_LOADING_TIMEOUT:m.CONFIG.PARTNER_TIMEOUT,RECENTLY_ONLINE_TIMEOUT:6000,STATES:{PLAYING:'music_playing',PAUSED:'music_paused',LOADING:'music_loading',DISABLED:'music_disabled',OFFLINE:'music_offline'},setState:function(u){if(u!==this.STATES.LOADING){this.resetLoadingTimers();this.previousState=this.state||u;}if(u===this.STATES.PLAYING){q.set(this.buttonElem,this.tooltip);}else q.set(this.buttonElem,'');var v=this.buttonElem.parentNode;this.state&&j.removeClass(v,this.state);this.state=u;j.addClass(v,this.state);},isTracksetable:function(u){return t.tracksetableTypes.indexOf(this.mediaType)!==-1;},handleIncomingEvent:function(u,v){clearTimeout(this._showLoadingTimer);if(v&&v.provider&&v.provider!=this.provider)return;switch(u){case m.DIAGNOSTIC_EVENT.ONLINE:case m.STATUS_CHANGE_EVENT.track:case m.STATUS_CHANGE_EVENT.playing:var w=v&&v.track&&v.track.uri,x=v&&v.context&&v.context.uri;if(v&&v.playing&&(m.sameURLs(w,this.url)||m.sameURLs(x,this.url))){this.setState(this.STATES.PLAYING);}else if(this.state===this.STATES.LOADING&&(this.previousState===this.STATES.PAUSED||this.previousState===this.STATES.OFFLINE)){clearTimeout(this._attemptingPlayTimer);this._attemptingPlayTimer=s(this.setState.bind(this,this.STATES.PAUSED),this.RECENTLY_ONLINE_TIMEOUT);}else if(!this._attemptingPlayTimer)this.setState(this.STATES.PAUSED);break;case m.DIAGNOSTIC_EVENT.OFFLINE:this.setState(this.STATES.OFFLINE);break;case m.DIAGNOSTIC_EVENT.ALL_OFFLINE:this.setState(this.STATES.OFFLINE);break;}},processClick:function(u,v){if(v!=this.buttonElem){if(this.state===this.STATES.LOADING)this.previousState&&this.setState(this.previousState);return;}var w=new p('music_play_button_click',null,{addBrowserFields:true,addPredictedGeographyFields:true,addUser:true});w.addNormal('uses_bridge','1');w.addNormal('state',this.state);w.addNormal('provider',this.provider);w.addNormal('class','MusicButton');w.addNormal('insights_source',this.context.appear_source_log_str);w.addDenorm('url',this.url);w.post();if(this.state!=this.STATES.PLAYING){g.bumpEntityKey('music_play_button','music_play_button_click');g.bumpEntityKey('music_play_button','music_play_button_click.'+this.provider);var x=o.byClass(this.buttonElem,"_4--s");if(x){j.addClass(x,"_4--t");setTimeout(j.removeClass.bind(null,x,"_4--t"),3000);}}var y=this.isTracksetable()&&o.byClass(this.buttonElem,'music_trackset_container'),z=[];if(y){var aa=y.getAttribute('data-trackset-title'),ba=this.provider,ca=k.scry(y,'.music_button');for(var da=0;da<ca.length;da++){var ea=l.getButton([ca[da].id]);if(ea&&ea.provider==ba&&ea.isTracksetable())z.push(ea.url);}}if(!a.Music)this.showLoading(true);h.loadModules(["Music"],function(fa){var ga=(y&&z.length>1)?fa.playPauseSongList(this.provider,this.url,z,aa,this.context):fa.playPauseSong(this.provider,this.url,this.context);this.showLoading(!ga);}.bind(this));},showLoading:function(u){this.resetLoadingTimers();this._hideLoadingTimer=s(this._timeout.bind(this,u),this.HIDE_LOADING_TIMEOUT);this._showLoadingTimer=s(this.setState.bind(this,this.STATES.LOADING),this.SHOW_LOADING_TIMEOUT);},resetLoadingTimers:function(){clearTimeout(this._hideLoadingTimer);clearTimeout(this._showLoadingTimer);clearTimeout(this._attemptingPlayTimer);this._attemptingPlayTimer=null;},destroy:function(){this.resetLoadingTimers();this.buttonElem=null;},_timeout:function(u){a.Music&&a.Music.reInform([this.provider]);if(!u&&this.state===this.STATES.LOADING)this.setState(this.STATES.PAUSED);}});e.exports=t;},null);
__d("MusicButtonManager",["Event","DOM","KeyedCallbackManager","Layer","MusicButton","MusicButtonStore","MusicConstants","MusicEvents","Parent","$","copyProperties","ge"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){var s=new i(),t=null,u={},v=0;function w(da){var ea=da.getTarget(),fa=o.byClass(ea,'music_button');fa=fa||(!(da.getModifiers&&da.getModifiers().any)&&x(ea));if(!fa)return;return y(fa,da);}function x(da){var ea=o.byClass(da,'music_button_trigger')&&o.byClass(da,'music_button_trigger_group');if(ea){var fa=h.scry(ea,'.music_button');if(fa.length)return fa[0];}return null;}function y(da,event){event&&event.stop();n.inform(m.MUSIC_BUTTON.ACTIVATE,da);return false;}function z(da){a.Music&&a.Music.reInform(da);}function aa(da,ea){var fa=l.getButtons();for(var ga in fa)if(fa[ga].noGC||r(ga)){fa[ga].handleIncomingEvent(da,ea);}else l.removeButton(ga);}var ba={init:function(da){if(t)return;t=true;k.tracksetableTypes=da||[];g.listen(document.body,'click',w);n.subscribe([m.STATUS_CHANGE_EVENT.playing,m.STATUS_CHANGE_EVENT.track,m.DIAGNOSTIC_EVENT.OFFLINE,m.DIAGNOSTIC_EVENT.ALL_OFFLINE,m.DIAGNOSTIC_EVENT.ONLINE],aa);},add:function(da,ea,fa,ga,ha,ia){t||ba.init();var ja=ea.id,ka=l.getButton(ja);if(ka)return ka;ka=l.addButton(ja,new k(da,ea,fa,q({button_id:ja},ga),ha,ia));var la=o.byClass(ea,'uiOverlay');if(la){ka.noGC=true;var ma=j.subscribe('destroy',function(na,oa){if(h.contains(oa.getRoot(),ea)){l.removeButton(ja);j.unsubscribe(ma);}});}if(da&&!u[da])u[da]=setTimeout(function(){var na=Object.keys(u);na.length&&z(na);u={};},0);return ka;},addButton:function(da,ea,fa,ga,ha,ia){if(!r(ea))return;var ja=p(ea);return ba.add(da,ja,fa,ga,ha,ia);},asyncAddMusicButton:function(da,ea){da.setAttribute('id','music_button_'+v++);ca(da,ea);},tryAddButtonInDOM:function(da,ea){var fa=r(da);fa&&ca(fa,ea);},addMusicData:function(da,ea,fa,ga,ha,ia){s.setResource(da,{provider:ea,uri:fa,context:ga,media_type:ha,tooltip:ia});}};function ca(da,ea){var fa=h.find(da,'a.button_anchor').getAttribute('href');s.executeOrEnqueue(fa,function(ga){return ba.add(ga.provider,da,ga.uri,ga.context,ga.media_type,ea?ga.tooltip:'');});}e.exports=a.MusicButtonManager||ba;},null);
__d("XPermalinkDialogControllerURIBuilder",["XControllerURIBuilder"],function(a,b,c,d,e,f){e.exports=b('XControllerURIBuilder').create("\/dialog\/permalink\/",{uri:{type:"String",required:true},__asyncDialog:{type:"Int"}});},null);