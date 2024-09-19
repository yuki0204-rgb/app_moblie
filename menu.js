window.addEventListener("load", function (e) {

    // comp_idとuser_idの取得
    const log_session_u = window.sessionStorage.getItem("user_id");
    const log_session_c = window.sessionStorage.getItem("comp_id");


    // ヘッダーとフッターを読み込む
    loadHeaderFooter()
    
    //言語変更アイコンクリック時
    $('.change_lang').on('click', function () {
      // 現在のURLを取得して翻訳をする
      let url = $(location).attr('href')
      // 固定URLで確認したところ、画面遷移してもそのまま翻訳される（ローカル環境だとうまくいかず）
      $('.change_lang')
        .find('a')
        .attr(
          'href',
          'https://translate.google.com/translate?sl=ja&tl=en&u=' + url
        )
    })
    
    // 要素をクリアしておく
    // 画像
    $(".header_logo").remove();
    // ヘッダータイトル
    $(".header_name").children("h1").empty();
    // ボタン
    $('.menu-content').find('ul').empty();
    // ハンバーガーメニュー
    $('.hamburger-menu').remove();

    // XMLファイルから情報を取得 webサーバーにて稼働する必要あり
    function getDelFlg(data) {
        return $.ajax({
            url: "SYSTEMINI.xml",
            type: "GET",
            cache: false,
            dataType: "text",
        });
    }


    // FUNCTIONINI.XMLからURLを取得して渡す
    function getUrl(data) {
        return $.ajax({
            url: "FUNCTIONINI.xml",
            type: "GET",
            cache: false,
            dataType: "text",
        })
    }

    getDelFlg().done(function (data) {
        $(data)
            .find("ROW")
            .each(function (index, item) {

                // SYSTEMINI.XMLよりKBN=001, CD=normalのものをdelete_flgとしてAPIに渡す
                let kbn = $(item).find("KBN").text();
                let cd = $(item).find("CD").text();
                let value = $(item).find("VALUE").text();

                if (kbn == "1" && cd == "normal") {
                    delete_flg = value;

                    // 画面レイアウト
                    e.preventDefault();
                    $.ajax({
                //  url: window.location.origin +"/AppSelectAPI/api/AppConfig/",
                   url: window.location.origin +":8080/api/AppConfig/",
                        type: "POST",
                        cache: false,
                        dataType: "json",
                        data: {
                            comp_id: log_session_c,
                            delete_flg: delete_flg,
                        },
                    }).done(function (data) {
                        
                        // ステータスコードが200以下の場合は終了
                        const status_code = data.status_code;
                        if (status_code != 200) {
                            // ステータスコードに応じてエラーメッセージをXMLから取得して表示
                        }

                        // ヘッダーの設定
                        // 表示名
                        const head_compname = data.appini[0]["head_COMPNAME"];
                        $(".header_name").find("h1").text(head_compname);
                        // ヘッダーアイコン(あるときのみ)
                        const head_logpath = data.appini[0]["head_LOG_IMAGE_PATH"];
                        if (head_logpath != null && head_logpath != "") {
                            let head_icon =
                                '<div class="header_logo"><img class="bg_dark_color" src="' +
                                head_logpath +
                                '" alt ="ロゴ"></div>';
                            $("header").find(".center").prepend(head_icon);
                        }

                        $("#all_category").val("全表示");

                        // 各カラーの設定
                        // base.cssに記載されている:root以下の変数を指定して一括変更
                        // お気に入りカラー
                        const color_favorite = data.appini[0]["color_FAVORITE"];
                        document
                            .querySelector(":root")
                            .style.setProperty("--accent_color", color_favorite);
                        // ヘッダアイコンカラー
                        const color_headicon = data.appini[0]["color_HEADICON"];
                        document
                            .querySelector(":root")
                            .style.setProperty("--main_color", color_headicon);
                        // メニューボタンカラー
                        const color_menubutton = data.appini[0]["color_MENUBUTTON"];
                        document
                            .querySelector(":root")
                            .style.setProperty("--base_color", color_menubutton);
                        // 背景・縁・区切り線カラー
                        const color_back = data.appini[0]["color_BACK"];
                        document
                            .querySelector(":root")
                            .style.setProperty("--bg_color", color_back);

                        //テキストカラーを変更する
                        document
                            .querySelector(":root")
                            .style.setProperty("--dark_text", "#333");

                        //グレイのボーダーを追加する
                        document
                            .querySelector(":root")
                            .style.setProperty("--white_line", "#A9A9A9");

                        //黒色のボーダーを追加する
                        document
                            .querySelector(":root")
                            .style.setProperty("--black_line", "#333");

                        // セッションに登録
                        // JSON文字列に変換してからsessionStorageに格納
                        let appini = JSON.stringify(data.appini);
                        window.sessionStorage.setItem(["appini"], [appini]);

                        //検索イメージを追加する
                        var image = document.createElement("img");
                        var imageParent = document.querySelector(".main_search");
                        image.id = "search_button";
                        image.src = "img/icon_search.svg";
                        //imageParent.appendChild(image);
                    });


                    //
                    //------ MENUの情報をAPIから取得-------
                    //
                    e.preventDefault();
                    $.ajax({
                 //    url: window.location.origin + "/AppSelectAPI/api/SelectList/getSelectList",
                     url: window.location.origin + ":8080/api/SelectList/getSelectList",
                        type: "POST",
                        cache: false,
                        dataType: "json",
                        data: {
                            comp_id: log_session_c,
                            view_kbn: "MENU",
                        },
                    })
                        .done(function (data) {
                            // ステータスコードが200以下の場合は終了
                            const status_code = data.status_code;                            
                            if (status_code != 200) {
                                // ステータスコードに応じてエラーメッセージをXMLから取得して表示
                                msgini_err(data.err_message);
                                // 終了 ログイン画面に戻る
                            }

                            // 選択機能の数を取得
                            let length = data.selectlist.length;
                            
                            // ハンバーガーメニュー
                            // 大枠を追加
                            let hamburger_box = '\
                                <div class="hamburger-menu">\
                                    <input type="checkbox" id="menu-btn-check">\
                                    <!-- メニューの中身 -->\
                                    <div class="menu-content">\
                                        <ul>\
                                        </ul>\
                                    </div>\
                                </div>\
                                ';
                            $('header .center').prepend(hamburger_box);

                            // フッター,メニューのHOME設定
                            // HOMEリンクはとりあえず一番上に
                            getUrl().done(function (xml_data) {
                                // 最初の処理（valueが300の場合）
                                $(xml_data).find("ROW").each(function (index, item) {
                                    let value = $(item).find('VALUE').text();
                                    if (value == "300") {
                                        let url = $(item).find('URL').text();
                                        let contents = '<li><a href="' + url + '">HOME</a></li>';
                                       $('.footer_nav_box').eq(0).find('a').attr("href", url);
                                        $(".menu-content").find("ul").prepend(contents);
                                    }
                                });
                                // 選択機能の個数分実施する
                                for (let i = 0; i < data.selectlist.length; i++) {
                                    let dspname = data.selectlist[i]["dspname"];
                                    let select_no = data.selectlist[i]["select_NO"];
                                    let dsp_method = data.selectlist[i]["dsp_METHOD"];
                                    const yuko_kbn = data.selectlist[i]["yuko_KBN"];
                                    if(yuko_kbn == "1" && dsp_method == "1"){
                                        $(xml_data).find("ROW").each(function (index, item) {
                                            // FUNCTIONINI.XML.VALUE = M_SELECTLIST.SELECT_NOのものを検索
                                            let value = $(item).find('VALUE').text();
                                            // 一覧
                                            let value_list = select_no.replace("0", "3");

                                            if (value == value_list) {
                                                let url = $(item).find('URL').text();
                                                // button要素を追加し、リンク先を変更する
                                                let contents = '<li><a href="'+url+'">' + dspname + '</a></li>';
                                                $(".menu-content").find("ul").append(contents);
                                            // $(".menu-content").find("a").eq(i).attr("href", url);
                                            }
                                        })
                                        
                                    }
                                }
                                const user_info_content = '<li><a href="entryinfo.html" class="main_sign_up_a"><span class="main_sign_up">情報変更</span></a></li>';  
                                
                                $(".menu-content").find("ul").append(user_info_content)

                              //  予約新規登録
                                const user_Reservation_add_content = '<li><a href="reservation_a.html" class="main_sign_up_a"><span class="main_sign_up">予約新規登録</span></a></li>';  
                                $(".menu-content").find("ul").append(user_Reservation_add_content)

                                //予約履歴情報
                                const user_Reservation_log_content = '<li><a href="reservation_log.html" class="main_sign_up_a"><span class="main_sign_up">予約情報</span></a></li>';  
                                $(".menu-content").find("ul").append(user_Reservation_log_content)



                                // 最後の処理（valueが111の場合）
                                $(xml_data).find("ROW").each(function (index, item) {
                                    let value = $(item).find('VALUE').text();
                                    if (value == "111") {
                                        let url = $(item).find('URL').text();
                                        let contents = '<li><a href="' + url + '">問合わせ</a></li>';
                                        $(".menu-content").find("ul").append(contents);
                                    }
                                });
                            });
                        })



                        //
                        //----------FOOTER用、FOOTERの情報をAPIから取得-----------
                        //                        
                        e.preventDefault();
                        $.ajax({
                       //  url: window.location.origin + "/AppSelectAPI/api/SelectList/getSelectList",
                        url: window.location.origin + ":8080/api/SelectList/getSelectList",
                            type: "POST",
                            cache: false,
                            dataType: "json",
                            data: {
                                comp_id: log_session_c,                             
                                view_kbn: "FOOTER",
                            },
                        })
                            .done(function (data) {
                                // ステータスコードが200以下の場合は終了
                                const status_code = data.status_code;                              
                                if (status_code != 200) {
                                    // ステータスコードに応じてエラーメッセージをXMLから取得して表示
                                    msgini_err(data.err_message);
                                    // 終了 ログイン画面に戻る
                                }
    
                                // 選択機能の数を取得
                                let length = data.selectlist.length;
                                
                                // ハンバーガーメニュー
                                // 大枠を追加
                                let hamburger_box = '\
                                    <div class="hamburger-menu">\
                                        <input type="checkbox" id="menu-btn-check">\
                                        <!-- メニューの中身 -->\
                                        <div class="menu-content">\
                                            <ul>\
                                            </ul>\
                                        </div>\
                                    </div>\
                                    ';
                                $('header .center').prepend(hamburger_box);
    
                                
    
                               // 真ん中３つは可変
                                for (let i = 0; i < 3; i++) {
                                    
                                    let dspname = data.selectlist[i]["dspname"];
                                    let select_icon = data.selectlist[i]["select_ICON"];
                                    let select_no = data.selectlist[i]["select_NO"];
                                    let sortno = data.selectlist[i]["sortno"];
    
                                    // アイコン画像と表示名の変更
                                    $('.nav_box_img').eq(i + 1).empty();
                                    $('.nav_box_img').eq(i + 1).append(select_icon);
                                    $('.nav_box_title').eq(i + 1).find('p').text(dspname);
    
    
                                    getUrl().done(function (data) {
                                        $(data).find("ROW").each(function (index, item) {
                                            // FUNCTIONINI.XML.VALUE = M_SELECTLIST.SELECT_NOのものを検索
                                            let value = $(item).find('VALUE').text();
                                            // 一覧
                                            let value_list = select_no.replace("0", "3");
                                            if (value == value_list) {
                                                let url = $(item).find('URL').text();
                                                $(".footer_nav_box").find("a").eq(i + 1).attr("href", url);
                                            }
                                        })
                                    })
                                }
                            })
                }
            })
    })
})

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(number) {
    let cookieNumber = getCookie("mycookie");

    cookieNumber = number;

    setCookie("mycookie", cookieNumber, 365);

    return cookieNumber;

}

