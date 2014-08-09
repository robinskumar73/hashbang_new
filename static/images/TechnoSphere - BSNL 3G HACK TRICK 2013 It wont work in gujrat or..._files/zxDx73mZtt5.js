/*!CK:433569396!*//*1407121627,*/

if (self.CavalryLogger) { CavalryLogger.start_js(["J4LsA"]); }

__d("List.react",["ReactPropTypes","React","cx","joinClasses"],function(a,b,c,d,e,f,g,h,i,j){var k=h.createClass({displayName:'List',propTypes:{border:g.oneOf(['none','light','medium','dark']),spacing:g.oneOf(['none','small','medium','large']),direction:g.oneOf(['vertical','horizontal']),valign:g.oneOf(['baseline','top','middle','bottom']),edgepadding:g.bool},getDefaultProps:function(){return {border:'medium',spacing:'medium',direction:'vertical',valign:'top'};},render:function(){var l=this.props.border,m=this.props.direction,n=this.props.spacing,o=m==='horizontal'&&this.props.valign,p,q,r;p=((m==='vertical'?"_4kg":'')+(m==='horizontal'?' '+"_4ki":'')+(o==='top'?' '+"_509-":'')+(o==='middle'?' '+"_509_":'')+(o==='bottom'?' '+"_50a0":''));if(n!=='none'||l!=='none')q=((l==='none'?"_6-i":'')+(l==='light'?' '+"_4ks":'')+(l==='medium'?' '+"_4kt":'')+(l==='dark'?' '+"_4ku":''));if(n!=='none')r=((!this.props.edgepadding?"_6-h":'')+(n==='small'?' '+"_704":'')+(n==='medium'?' '+"_6-j":'')+(n==='large'?' '+"_703":''));var s=j("uiList",p,q,r);return (h.createDescriptor(h.DOM.ul,Object.assign({},this.props,{className:j(this.props.className,s)}),this.props.children));}});e.exports=k;},null);
__d("XUIBlock",["ReactPropTypes","cx"],function(a,b,c,d,e,f,g,h){var i={propTypes:{background:g.oneOf(['base-wash','light-wash','white','highlight','transparent'])},getDefaultProps:function(){return {background:'transparent'};},getBackgroundClass:function(j){var k=((j.background==='base-wash'?"_4-u5":'')+(j.background==='light-wash'?' '+"_57d8":'')+(j.background==='white'?' '+"_4-u8":'')+(j.background==='highlight'?' '+"_4-u7":''));return k;}};e.exports=i;},null);
__d("XUICard.react",["React","XUIBlock","cx","joinClasses"],function(a,b,c,d,e,f,g,h,i,j){var k=g.createClass({displayName:'XUICard',propTypes:h.propTypes,getDefaultProps:h.getDefaultProps,render:function(){var l=j("_4-u2",h.getBackgroundClass(this.props));return (g.createDescriptor(g.DOM.div,Object.assign({},this.props,{className:j(this.props.className,l)}),this.props.children));}});e.exports=k;},null);
__d("XUICardSection.react",["React","XUIBlock","cx","joinClasses"],function(a,b,c,d,e,f,g,h,i,j){var k=g.createClass({displayName:'XUICardSection',propTypes:h.propTypes,getDefaultProps:h.getDefaultProps,render:function(){var l=j("_4-u3",h.getBackgroundClass(this.props));return (g.createDescriptor(g.DOM.div,Object.assign({},this.props,{className:j(this.props.className,l)}),this.props.children));}});e.exports=k;},null);
__d("XUITypeaheadTextOnlyView.react",["ReactPropTypes","React","TypeaheadViewItem","cx"],function(a,b,c,d,e,f,g,h,i,j){var k=h.createClass({displayName:'XUITypeaheadTextOnlyViewItem',mixins:[i.Mixin],propTypes:i.propTypes,render:function(){var m=this.props.entry,n=(("_599m")+(this.props.highlighted?' '+"_599n":''));return (h.createDescriptor(h.DOM.li,{key:m.getUniqueID(),className:n,onMouseDown:this._onSelect,onMouseEnter:this._onHighlight},h.createDescriptor(h.DOM.div,{className:"_599p"},m.getTitle())));}}),l=h.createClass({displayName:'XUITypeaheadTextOnlyView',propTypes:{highlightedEntry:g.object,entries:g.array.isRequired,onSelect:g.func.isRequired,onHighlight:g.func.isRequired,onRenderHighlight:g.func},_renderItem:function(m){var n=m===this.props.highlightedEntry;return (h.createDescriptor(k,{entry:m,highlighted:n,onSelect:this.props.onSelect,onHighlight:this.props.onHighlight,onRenderHighlight:this.props.onRenderHighlight}));},render:function(){var m=(("_599r")+(!this.props.entries.length?' '+"_599s":''));return (h.createDescriptor(h.DOM.ul,{className:m},this.props.entries.map(this._renderItem)));}});e.exports=l;},null);
__d("XUITypeaheadView.react",["BackgroundImage.react","ImageBlock.react","ReactPropTypes","React","TypeaheadViewItem","cx"],function(a,b,c,d,e,f,g,h,i,j,k,l){var m=j.createClass({displayName:'XUITypeaheadViewItem',mixins:[k.Mixin],propTypes:k.propTypes,render:function(){var o=this.props.entry,p=o.getSubtitle().split(' \u00b7 ')[0],q=p?j.createDescriptor(j.DOM.div,{className:"_599q"},p):null,r=o.getPhoto()?j.createDescriptor(g,{width:32,height:32,backgroundSize:"cover",src:o.getPhoto()}):j.createDescriptor(j.DOM.span,null),s=(("_599m")+(!q?' '+"_5mne":'')+(this.props.highlighted?' '+"_599n":''));return (j.createDescriptor(j.DOM.li,{className:s,onMouseDown:this._onSelect,onMouseEnter:this._onHighlight},j.createDescriptor(h,{spacing:"medium"},r,j.createDescriptor(j.DOM.div,null,j.createDescriptor(j.DOM.div,{className:"_599p"},o.getTitle()),q))));}}),n=j.createClass({displayName:'XUITypeaheadView',propTypes:{highlightedEntry:i.object,entries:i.array.isRequired,onSelect:i.func.isRequired,onHighlight:i.func,onRenderHighlight:i.func},_renderItem:function(o){var p=o===this.props.highlightedEntry;return (j.createDescriptor(m,{key:o.getUniqueID(),entry:o,highlighted:p,onSelect:this.props.onSelect,onHighlight:this.props.onHighlight,onRenderHighlight:this.props.onRenderHighlight}));},render:function(){var o=(("_599r")+(!this.props.entries.length?' '+"_599s":''));return (j.createDescriptor(j.DOM.ul,{className:o},this.props.entries.map(this._renderItem)));}});e.exports=n;},null);
__d("XUITypeahead.react",["AbstractTypeahead.react","React","Image.react","SearchableEntry","XUICloseButton.react","XUITypeaheadTextOnlyView.react","XUITypeaheadView.react","cx","joinClasses"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o){var p=h.PropTypes,q={ViewRenderer:m,useLayer:true},r={ViewRenderer:m,useLayer:false},s={ViewRenderer:l,useLayer:true},t=h.createClass({displayName:'XUITypeahead',propTypes:{autoHighlight:p.bool,maxEntries:p.number,onBlur:p.func,onChange:p.func.isRequired,onFocus:p.func,onSelectAttempt:p.func.isRequired,placeholder:p.string,queryString:p.string,selectedEntry:p.instanceOf(j),searchSource:p.object.isRequired,searchSourceOptions:p.object,selectOnBlur:p.bool,showEntriesOnFocus:p.bool,focusedOnInit:p.bool,tallInput:p.bool,viewStyle:p.oneOf(['textonly','rich','richNoLayer']),clearable:p.bool,onClear:p.func,showPhoto:p.bool,highlightOnSelect:p.bool,presenter:p.object,hideViewWithEntries:p.bool},getDefaultProps:function(){return {viewStyle:'rich'};},componentWillMount:function(){if(!this.props.presenter&&this.props.maxEntries)q.maxEntries=r.maxEntries=s.maxEntries=this.props.maxEntries;},focusInput:function(){this.refs.typeahead.focusInput();},hideView:function(){this.refs.typeahead.hideView();},_onClear:function(){this.props.onClear();setTimeout(function(){return this.focusInput();}.bind(this),0);},render:function(){var u=(("_55r1")+(!!this.props.tallInput?' '+"_55r2":'')),v=null;if(this.props.presenter){v=this.props.presenter;}else if(this.props.viewStyle=='rich'){v=q;}else if(this.props.viewStyle=='richNoLayer'){v=r;}else v=s;var w=this.props.showPhoto&&this.props.selectedEntry?h.createDescriptor(i,{className:"_wrl",src:this.props.selectedEntry.getPhoto()}):null,x=this.props.clearable?h.createDescriptor(k,{className:(("_wrm")+(!this.props.queryString?' '+"hidden_elem":'')),size:this.props.tallInput?'medium':'small',onClick:this._onClear}):null,y=this.props,z=y.className,aa=(function(ba,ca){var da={},ea=Object.prototype.hasOwnProperty;if(ba==null)throw new TypeError();for(var fa in ba)if(ea.call(ba,fa)&&!ea.call(ca,fa))da[fa]=ba[fa];return da;})(y,{className:1});return (h.createDescriptor(h.DOM.span,{className:o((("_wrn")+(!!this.props.tallInput?' '+"_213j":'')+(!!x?' '+"_4ehf":'')+(!!w?' '+"_4ehg":'')+(this.props.highlightOnSelect&&this.props.selectedEntry?' '+"_wrr":'')),z)},w,h.createDescriptor(g,Object.assign({},aa,{queryString:this.props.queryString,inputClassName:u,onChange:this.props.onChange,onSelectAttempt:this.props.onSelectAttempt,ref:"typeahead",presenter:v,excludedEntries:this.props.excludedEntries})),x));}});e.exports=t;},null);