$(document).ready(function() {
    const log_session_u = window.sessionStorage.getItem("user_id");
    const log_session_c = window.sessionStorage.getItem("comp_id");
    // const log_session_re = window.sessionStorage.getItem("reservation_id");
    // console.log("reservation_id:", reservation_id)

    //$('.main_card_box').remove();
    let unit = 5;

           $.ajax({
            url: window.location.origin + ":8080/api/ReservationAdd/getViewResData",
            type: "POST",
            cache: false,
            dataType: "json",
            data: {
                user_id: log_session_u,
                comp_id: log_session_c,
               // log_session_re: log_session_re,
                delete_flg: 0,
            },
        })
        .done(function(data) {
            console.log("Response data:", data);

            if (!data.ResViewListData) {
                console.error("Data.ResViewListData データがありません");
                return;
            }

            const status_code = data.status_code;
            if (status_code != "200") {
                msgini_err(status_code);
            } else {
              //  let courseData = [];

                //予約
                $(data.ResViewListData).each(function(reserindex, reseritem) {
                    // API からのデータで HTML 要素を更新
                    $('#reservation_name').text(reseritem.reservation_NAME);
                    $('#reservation_conditions').text(reseritem.reserve_CONDITION);
                    $('#cancel_policy').text(reseritem.cancel_POLICY); 
                    $('#type_group_name').text(reseritem.type_GROUP_NAME);     
                    
                });   
              

                $(data.ResViewListData).each(function(reserindex, reseritem) {
                     // set_UNIT ⇒ unit
                     if (reseritem.set_UNIT) {
                        unit = parseInt(reseritem.set_UNIT, 10);       
                        console.log("unit:", unit)
                     }

        
                  //  console.log("reseritem:" , reseritem)
                //     let courseIndex = findOrCreateIndex(courseData, reseritem.reserve_COURSE);
                //     let typeIndex = findOrCreateIndex(courseData[courseIndex], reseritem.type_NAME);
                //     let dateIndex = findOrCreateIndex(courseData[courseIndex][typeIndex], reseritem.datestr);
        
                //     console.log("courseIndex: ", typeIndex)
                //     if (!courseData[courseIndex][typeIndex][dateIndex]) {
                //         courseData[courseIndex][typeIndex][dateIndex] = [[], []]; 
                //     }
        
                //     // let displayStatus = reseritem.time_status;
                //    //  let reserveStatus = reseritem.reserve_STATUS;

                   
                //     if (!Array.isArray(courseData[courseIndex][typeIndex][dateIndex][0])) {
                //         console.log("aaa")
                //         courseData[courseIndex][typeIndex][dateIndex][0] = [];
                //     }
                //     if (!Array.isArray(courseData[courseIndex][typeIndex][dateIndex][1])) {
                //         console.log("bbb")
                //         courseData[courseIndex][typeIndex][dateIndex][1] = [];
                //     }

                   //  courseData[courseIndex][typeIndex][dateIndex][0].push(displayStatus);
                    // courseData[courseIndex][typeIndex][dateIndex][1].push(reserveStatus);
                });

                updateTableContent();
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Request failed:", textStatus, errorThrown);
            console.error("Response Text:", jqXHR.responseText);
        });


        //予約情報を表示、予約可、不可表示      
        $.ajax({
            url: window.location.origin + ":8080/api/ReservationAdd/getViewRevArray",
            type: "POST",
            cache: false,
            dataType: "json",
            data: {
                user_id: log_session_u,
                comp_id: log_session_c,
                delete_flg: 0
            },
        })
        .done(function(data) {
            console.log("Dữ liệu phản hồi:", data);

            if (data.status_code != "200") {
                console.error("error:", data.err_message);
                return;
            }

            var courses = {};  // オブジェクトを使用してコースごとにデータをグループ化する
            var types = {};    // オブジェクトを使用してデータをタイプ別にグループ化する

            //--dropdown　コースと種別と
            $(data.ResViewArrayData).each(function(reserindex, reseritem) {
                 // set_UNIT ⇒ unit
                 if (reseritem.set_UNIT) {
                    unit = parseInt(reseritem.set_UNIT, 10);
                   
                }

                // データをコースごとにグループ化する
                if (reseritem.reserve_COURSE) {
                    if (!courses[reseritem.reserve_COURSE]) {
                        courses[reseritem.reserve_COURSE] = new Set();
                    }
                    // コースごとに種類タイプごとにデータをグループ化
                    if (reseritem.type_NAME) {
                        courses[reseritem.reserve_COURSE].add(reseritem.type_NAME);
                    }
                }
            });               

            // コースオプションを更新
            const courseSelect = $('#course_select');
            courseSelect.empty(); //  現在のオプションをすべて削除
            $.each(courses, function(course, typesSet) {
                const courseOption = $('<option></option>');
                courseOption.val(course);
                courseOption.text(course);
                courseSelect.append(courseOption);
            });

            //更新されたタイプタイプオプション
            const typeSelect = $('#type_select');
            typeSelect.empty(); //現在のオプションをすべて削除
            var uniqueTypes = new Set(); //重複を避けるため

            $.each(courses, function(course, typesSet) {
                typesSet.forEach(function(type) {
                    uniqueTypes.add(type);
                });
            });

            uniqueTypes.forEach(function(type) {
                const typeOption = $('<option></option>');
                typeOption.val(type);
                typeOption.text(type);
                typeSelect.append(typeOption);
            });
            
            const reservationData = data.ResViewArrayData;

            if (!reservationData || reservationData.length === 0) {
                console.error("データがありません");
                return;
            }


            // #table_body
            updateTableBody(reservationData);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error("失敗:", textStatus, errorThrown);
        });
        

        function findOrCreateIndex(array, key) {
            if (!array[key]) {
                array[key] = [];
            }
            return key;
        }

   
        //-----テーブルの内容ひょ--------courseData
        function updateTableContent() {
            const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
            const daysToDisplay = 30; // 受付開始日数 (d) は30日
            const daysInWeek = 7;
            let startDate = new Date(); // Bắt đầu từ hôm nay

            let endDate = calculateEndDate(startDate); // 表示 終了日

                function calculateEndDate(start) {
                    let calculatedEndDate = new Date(start);// 受付終了日
                    calculatedEndDate.setDate(start.getDate() + daysToDisplay - 1);

                    // 表示期間を7日で割った余りを計算する
                    let totalDays = Math.ceil((calculatedEndDate - start) / (1000 * 60 * 60 * 24)) + 1;
                    let remainderDays = totalDays % daysInWeek;

                    // 最終週を7日間にするために終了日に余りを追加する
                    if (remainderDays > 0) {
                        calculatedEndDate.setDate(calculatedEndDate.getDate() + (daysInWeek - remainderDays));
                    }
                    return calculatedEndDate;
                }
        
            // 現在のテーブルの内容を削除
                function updateTable(){
                    let headers = $('#table_header');
                    headers.empty();
                    headers.append('<th>開始<br>時間</th>');
                    let displayStartDate = new Date(startDate);

                    // 日付のタイトルを追加
                    for (let i = 0; i < daysInWeek; i++) {
                        let date = new Date(displayStartDate);
                        date.setDate(displayStartDate.getDate() + i);
                        let dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                        let dayStr = daysOfWeek[date.getDay()];
                        let dayClass = (date.getDay() === 6) ? 'saturday' : (date.getDay() === 0) ? 'sunday' : '';
                        headers.append(`<th class="${dayClass}"><span class="end_date">${dateStr}</span><span>${dayStr}</span></th>`);
                    }
                    

                    // テーブルの内容を更新
                    let tbody = $('#table_body');
                    tbody.empty();
                    let times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
                
                    times.forEach(function(time) {
                        let row = $('<tr></tr>');
                        row.append(`<th>${time}</th>`);
                        for (let i = 0; i < daysInWeek; i++) {
                            let date = new Date(displayStartDate);
                            date.setDate(displayStartDate.getDate() + i);
                          //  row.append($('<td></td>').append(`<input type="hidden" value="a" class=""><button class="time-slot-btn"><svg><use xlink:href="#icon_circle"></use></svg></button>`));
                            
                          // Lưu ngày và thời gian vào thuộc tính data
                            let dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                            let dateTimeStr = `${dateStr} ${time}`;

                            let td = $('<td></td>').attr('data-date-time', dateTimeStr);
                            td.append(`<input type="hidden" value="a" class=""><button class="time-slot-btn"><svg><use xlink:href="#icon_circle"></use></svg></button>`);
                            row.append(td);
                            
                            //lay gia tri cua ngay thang trong button o
                            let dateTime = td.attr('data-date-time');
                           // console.log("dateTime", dateTime)
                       
                        }
                       
                    tbody.append(row);
                    });
 
 
                                

                    //-----毎週更新されたナビゲーション ボタン--------
                    let currentWeekStart = new Date();
                    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
                    let weekStart = new Date(startDate);
                    weekStart.setDate(weekStart.getDate() - startDate.getDay());

                    $('#prev_week').toggleClass('is-disabled', weekStart <= currentWeekStart);
                    let lastEndDateElement = $('.end_date').last();
                    let dateText = lastEndDateElement.text();
                    let [month, day] = dateText.split('/').map(Number);
                    let year = new Date().getFullYear();
                    let lastEndDate = new Date(year, month - 1, day);
                    // 正確に比較するには、時分秒を 0 に設定
                    lastEndDate.setHours(0, 0, 0, 0); 
                    endDate.setHours(0, 0, 0, 0); 
                    
                    $('#next_week').toggleClass('is-disabled', lastEndDate.getTime() >= endDate.getTime());
                    if (lastEndDate.getTime() >= endDate.getTime()) {
                        $('#next_week').addClass('is-disabled');
                        $('#notification').text('30日過ぎました');
                    } else {
                        $('#next_week').removeClass('is-disabled');
                        $('#notification').text('');
                    }
                        
                }

                    // 週ナビ機能
                    function navigateWeek(offset) {
                        startDate.setDate(startDate.getDate() + offset);
                        updateTable();
                    }

                    //週間ナビゲーション ボタンのイベントをクリック
                    $('#prev_week').click(function() {
                        if (!$(this).hasClass('is-disabled')) {
                            navigateWeek(-7);
                        }
                    });

                    $('#next_week').click(function() {
                        if (!$(this).hasClass('is-disabled')) {
                            navigateWeek(7);
                        }
                    });
            
            
                    //この関数はテーブルの内容を更新
                    updateTable();              
        }


                //表示時間の計算方法ポップアップ
                function generateTimeSlots(startHour, startMinute, unit) {
                    const timeSelectDiv = $('.rev_time_select');
                    timeSelectDiv.empty();

                    const startTime = new Date();
                    startTime.setHours(startHour, startMinute, 0);
                    const endTime = new Date(startTime);
                    endTime.setMinutes(startTime.getMinutes() + 60);
                
                    let currentTime = new Date(startTime);
                    const timeSlots = [];
                
                    while (currentTime < endTime) {
                        const hours = currentTime.getHours().toString().padStart(2, '0');
                        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
                        const timeString = `${hours}:${minutes}~`;
                        timeSlots.push(timeString);
                
                        const button = $('<button></button>');
                        const svg = $('<svg></svg>').append($('<use></use>').attr('xlink:href', '#icon_circle'));
                        button.append(svg).append(`<span>${timeString}</span>`);
                
                        timeSelectDiv.append(button);
                
                        currentTime.setMinutes(currentTime.getMinutes() + unit);//10:00~ , 10:15~
                    }
                    return timeSlots;
                }


       

        
                    // ----タイムピッカーボタンのイベントをクリック---
                $('#table_body').on('click', '.time-slot-btn', function(e) {
                        e.preventDefault();         
                        //ー時間（選択した時間）を取得
                        const time = $(this).closest('tr').find('th').text().trim();
                        const [selectedHour, selectedMinute] = time.split(':').map(Number);
                        // 選択した時間と単位に基づいて時間ノードを作成する関数を呼び出
                        generateTimeSlots(selectedHour, selectedMinute, unit);
                        //popup表示
                        $('#myModal1').show();
                });

                    // ポップアップ閉じる
                $('.modal_close').click(function() {
                        $('#myModal1').hide();
                });

                    // モーダルコンテンツの外側をクリックするとポップアップを閉じる
                $(window).click(function(event) {
                        if ($(event.target).is('#myModal1')) {
                            $('#myModal1').hide();
                        }
                });




                function updateTableBody(reservations, set_UNIT) {
                    
                }
        
      
        


        
   
});
