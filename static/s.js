'use strict';
$(document).ready(function() {

  let i = new Inventory();


});


class Inventory{
  constructor(){
    this.users = this.get_users();
    this.selected_user; //obj
    this.inventories = {};
    this.selected_inventory; //str
    this.selected_inventory_page = 0;
    this.descriptions = {};
    this.selected_item; //obj
    this.init();

  }

  init(){
    $('#pagebtn_next').click(this.click_next_page.bind(this));
    $('#pagebtn_previous').click(this.click_prev_page.bind(this));
  }



  get_users(){
    $.ajax({
      type: 'GET',
      url: "/api/get_users/",
      success: function(result) {
        this.users = result.data;
        if (this.users.length >0){
          this.selected_user = this.users[0];
          this.get_inventory();
        }
      }.bind(this)
    });
  }

  build_inventory(user = this.selected_user){
    let dinv = $('#inventories')[0];
    $('.inventory_ctn').remove();
    let inv = this.inventories[user.login]
    for(let i in inv){
      let div = $(document.createElement('div')).attr({class: 'inventory_ctn', id: 'inventory_'+user.steamid+'_'+i}).prependTo(dinv)[0];
      $(div).hide();
      let inpage, j, num=0;
      for(let c in inv[i]){
        for(j=0; j<inv[i][c].assets.length; j++){
          let items = inv[i][c].assets;
          this.add_descriptions(inv[i][c].descriptions);
          if(num%25 == 0){
            inpage = $(document.createElement('div')).attr({class: 'inventory_page'}).prependTo(div)[0];
            $(inpage).hide();
          }
          let item = $(document.createElement('div')).attr({class: 'itemHolder'}).appendTo(inpage)[0];
          item = $(document.createElement('div')).attr({class: 'item app' + i + ' context' + c, id: ""+i+'_'+c+"_"+items[j].assetid}).appendTo(item)[0];
          item.item=items[j];
          $(document.createElement('img')).attr({src:this.imageURL(this.descriptions[items[j].classid].icon_url, '96f', '96f', true)}).appendTo(item);
          num++;
        }
      }
      inv[i].pages = num%25;
      let lasts = 25 - num%25;
      for(; lasts>0; lasts--){
        $(document.createElement('div')).attr({class: 'itemHolder disabled'}).appendTo(inpage);
      }

    }
    this.selected_inventory = Object.keys(inv)[0];
    this.selected_inventory_page = 0;
    $('.item').click(this.click_item.bind(this));
    this.change_inventory();
  }

  change_page(shist = 0){
    let page = this.selected_inventory_page + shist;
    let tmp = $('#inventory_'+this.selected_user.steamid+'_'+this.selected_inventory)[0];
    let max_page = $(tmp).find('.inventory_page').length-1;
    if(page>max_page){
      this.selected_inventory_page = max_page;
      return;
    }else if(page<0){
      this.selected_inventory_page = 0;
      return;
    }
    this.selected_inventory_page = page;
    if(page==0){$('#pagebtn_previous').addClass('disabled');}else{$('#pagebtn_previous').removeClass('disabled');}
    if(page==max_page){$('#pagebtn_next').addClass('disabled');}else{$('#pagebtn_next').removeClass('disabled');}
    tmp = $(tmp).find('.inventory_page').hide();
    $(tmp[page]).show();
    $('#pagecontrol_cur')[0].innerText = this.selected_inventory_page+1;
    $('#pagecontrol_max')[0].innerText = max_page+1;
  }


  change_inventory(inv = this.selected_inventory){
    $('.inventory_ctn').hide();
    let tmp = $('#inventory_'+this.selected_user.steamid+'_'+inv)[0];
    $(tmp).show();
    this.change_page();
  }

  click_item(e){
    this.selected_item = e.currentTarget.item;
    this.show_item_info();
  }

  click_next_page(e){
    this.change_page(1);
  }

  click_prev_page(e){
    this.change_page(-1);
  }

  show_item_info(item = this.selected_item){
    let iteminfo = $('#iteminfo0')[0];
    let descr = this.descriptions[item.classid];
    $(iteminfo).empty();
    let dom = $(document.createElement('div')).attr({class: 'item_desc_content app753 context6', id: 'iteminfo0_content'}).appendTo(iteminfo)[0];
    dom = $(document.createElement('div')).attr({class: 'item_desc_icon'}).appendTo(dom)[0];
    dom = $(document.createElement('div')).attr({class: 'item_desc_icon_center'}).appendTo(dom)[0];
    dom = $(document.createElement('img')).attr({id: 'iteminfo1_item_icon', src:'http://steamcommunity-a.akamaihd.net/economy/image/'+descr.icon_url_large + '/330x192'}).appendTo(dom)[0];

    dom = $('#iteminfo0_content')[0];
    dom = $(document.createElement('div')).attr({class: 'item_desc_description'}).appendTo(dom)[0];
    $(document.createElement('h1')).attr({class: 'hover_item_name'}).appendTo(dom)[0].innerText= descr.name;
    let d = $(document.createElement('div')).attr({class: 'item_desc_game_info', id: 'iteminfo0_game_info'}).appendTo(dom)[0];
    d = $(document.createElement('div')).attr({class: 'item_desc_game_icon'}).appendTo(d)[0];
    $(document.createElement('img')).attr({id: 'iteminfo0_game_icon', src: 'http://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/753/135dc1ac1cd9763dfc8ad52f4e880d2ac058a36c.jpg'}).appendTo(d)[0];
    $(document.createElement('div')).attr({class: 'ellipsis', id: 'iteminfo0_game_name'}).appendTo(dom)[0].innerText = descr.market_name;

    dom = $('#iteminfo0_content')[0];
    dom = $(document.createElement('div')).attr({class: 'item_desc_descriptors', id:'iteminfo0_item_tags'}).appendTo(dom)[0];
    let tgs = '';
    if(descr.tradable==1){tgs +='можно обменивать, ';}
    if(descr.marketable==1){tgs +='можно продавать, ';}
    dom.innerText = tgs;
  }

  add_descriptions(desc){
    for(let i in desc){
      let d = desc[i];
      this.descriptions[d.classid] = d;
    }
  }

  imageURL( imageName, x, y, bEnableHighDPI ){
    if ( imageName )
    {
      x = x ? x : 0;
      y = y ? y : 0;
      let strSize = '';
      if ( x != 0 || y != 0 )
      {
        strSize = '/' + x + 'x' + y;
        if ( bEnableHighDPI )
        strSize += 'dpx2x';
      }
      return 'http://community.edgecast.steamstatic.com/economy/image/' + this.v_trim(imageName) + strSize;
    }
    else
    return 'http://community.edgecast.steamstatic.com/public/images/trans.gif';
  }

  v_trim( str ){
    if ( str.trim ){return str.trim();}
    else{return str.replace(/^\s+/, '').replace(/\s+$/, '');}
  }

  SelectItem(event, elItem, rgItem, bUserAction ){
  	if ( event )
  		event.preventDefault();

  	var bShouldShowPopup = ( g_bIsInventoryPage && Economy_UseResponsiveLayout() );

  	if ( g_bIsTrading )
  	{
  		// in trading you can't "select" items, for the most part.  Only on touch, or in responsive mode (no hovers)
  		// parent_item indicates it's a stack of currency in a trade - clicking it presents a dialog instead of our popup
  		if ( ( rgItem.in_touch || ( Economy_UseResponsiveLayout() ) ) &&
  			!rgItem.parent_item )
  			bShouldShowPopup = true;
  		else
  			return;
  	}

  	var iNewSelect = ( iActiveSelectView == 0 ) ? 1 : 0;
  	var sOldInfo = 'iteminfo' + iActiveSelectView;
  	var sNewInfo = 'iteminfo' + iNewSelect;


  	var elOldInfo = $(sOldInfo);
  	var elNewInfo = $(sNewInfo);

  	elOldInfo.style.position = 'absolute';
  	elNewInfo.style.position = '';

  	if ( elNewInfo.visible && !bShouldShowPopup )
  	{
  		elNewInfo.effect && elNewInfo.effect.cancel();
  		elNewInfo.hide();
  		elNewInfo.style.opacity = 1;
  	}
  	if ( elNewInfo.blankTimeout )
  	{
  		window.clearTimeout( elNewInfo.blankTimeout );
  	}
  	BuildHover( sNewInfo, rgItem, UserYou );


  	if ( bShouldShowPopup )
  	{
  		// event indicates the user tapped an item, otherwise they may have just switched inventories
  		if ( bUserAction )
  		{
  			var $Info = $J(elNewInfo);

  			var $BtnAddToTrade = $Info.find('.item_desc_addtotrade');
  			if ( $BtnAddToTrade.length && typeof OnDoubleClickItem != 'undefined' )
  			{
  				var bInTrade = $J(elItem).parents('.itemHolder').hasClass('trade_slot');

  				if ( bInTrade )
  				{
  					$BtnAddToTrade.removeClass('btn_green_white_innerfade' ).addClass('btn_grey_white_innerfade');
  					$BtnAddToTrade.children('span' ).text( 'Убрать из обмена' );
  				}
  				else
  				{
  					$BtnAddToTrade.removeClass('btn_grey_white_innerfade' ).addClass('btn_green_white_innerfade');
  					$BtnAddToTrade.children('span' ).text( 'Добавить в обмен' );
  				}

  				$BtnAddToTrade.on('click', function() {
  					g_ActiveItemPopupModal && g_ActiveItemPopupModal.Dismiss();
  					OnDoubleClickItem( null, elItem );
  				} );

  				if ( typeof g_bReadOnly != 'undefined' && g_bReadOnly )
  					$BtnAddToTrade.hide();
  				else
  					$BtnAddToTrade.show();
  			}

  			ShowItemHoverAsPopup( $Info, function() {
  				$BtnAddToTrade.off('click');

  				$J('.inventory_page_right' ).append( $Info );
  				g_ActiveItemPopupModal = null;
  			} );
  		}
  	}
  	else
  	{
  		elOldInfo.style.zIndex = 2;
  		elNewInfo.style.zIndex = 1;
  		elNewInfo.show();

  		elOldInfo.hiding = false;
  		HideWithFade( elOldInfo );
  	}

  	if ( elOldInfo.builtFor && elOldInfo.builtFor.element )
  		elOldInfo.builtFor.element.removeClassName('activeInfo');
  	$(rgItem.element).addClassName('activeInfo');
  	this.selectedItem = rgItem;

  	// the user has the appwide context selected, so update the active item there.
  	if ( g_ActiveInventory && g_ActiveInventory != this && g_ActiveInventory.contextid == APPWIDE_CONTEXT )
  		g_ActiveInventory.selectedItem = rgItem;

  	elOldInfo.blankTimeout = window.setTimeout( function() { $(sOldInfo+'_item_icon').src = 'http://steamcommunity-a.akamaihd.net/public/images/trans.gif'; }, 200 );

  	iActiveSelectView = iNewSelect;
  }


  get_inventory(login = this.selected_user['login']){
    if(!login){return;}
    $.ajax({
      type: 'GET',
      url: "/api/get_inventory/",
      data:{login:login},
      context:{login:login},
      success: function(result) {
        this.inventories[login] = result.data;
        this.build_inventory();
      }.bind(this)
    });
  }



}
