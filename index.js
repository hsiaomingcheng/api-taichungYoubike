(function () {
    function handleOnload() {
        var buttonPrev = document.getElementById('button-prev');
        var buttonNext = document.getElementById('button-next');
        var tableWrap = document.getElementById('table-wrap');
        var areaWrap = document.getElementById('area-wrap');
        var langWrap = document.getElementById('lang-wrap');
        var pageWrap = document.getElementById('page-wrap');
        var structureDom = '';
        var showNumber = 10; /* 欲顯示的筆數 */
        var pageNumber = 0;  /* 目前所在頁數 */
        var lastPageNumber = 0; /* 最後一頁 */
        var responseData = [];
        var renderArray = []; /* 渲染陣列 */
        var areaArray = []; /* 各區陣列 */
        var selfArray = []; /* 自己整理過的陣列 */
        var lang = 'zh-tw';

        var apiObject = {
            handlePage: function (now, last) {
                pageWrap.innerHTML = '<span>' + now + '</span>/<span>' + last + '</span>';
            },
            handleLangChange: function () {
                /* 語系下拉選單切換處理 */
                lang = langWrap.value;

                apiObject.handleRender(pageNumber);
            },
            handleAreaChange: function () {
                /* 各區下拉選單切換處理 */
                var selectedArea = areaWrap.value;

                renderArray = [];
                pageNumber = 0;

                if (selectedArea === '顯示全區') {
                    renderArray = selfArray;
                } else {
                    selfArray.forEach(function (currentValue, index, arr) {
                        if (currentValue.cArea == selectedArea) {
                            renderArray.push(arr[index]);
                        }
                    });
                }

                apiObject.handleCountPage(renderArray);

                apiObject.handleRender(pageNumber);
            },
            handleArea: function () {
                /* 建立一個不重複各區的下拉選單 */
                var tmpArray = [];
                var optionList = '';

                tmpArray[0] = '顯示全區';

                renderArray.forEach(ele => {
                    tmpArray.push(ele.cArea);
                });

                areaArray = tmpArray.filter(function (element, index, arr) {
                    return arr.indexOf(element) === index;
                });

                areaArray.map(ele => {
                    optionList = optionList + '<option value="' + ele + '">' + ele + '</option>';
                });

                areaWrap.innerHTML = optionList;
            },
            handleBindEvent: function () {
                buttonNext.addEventListener('click', this.handleToNextPage);
                buttonPrev.addEventListener('click', this.handleToPrevPage);
                areaWrap.addEventListener('change', this.handleAreaChange);
                langWrap.addEventListener('change', this.handleLangChange);
            },
            handleToPrevPage: function () {
                /* 切換至上一頁 */
                if (0 < pageNumber) {
                    pageNumber = pageNumber - 1;
                    apiObject.handleRender(pageNumber);
                    apiObject.handlePage(pageNumber + 1, lastPageNumber + 1);
                }
            },
            handleToNextPage: function () {
                /* 切換至下一頁 */
                if (pageNumber < lastPageNumber) {
                    pageNumber = pageNumber + 1;
                    apiObject.handleRender(pageNumber);
                    apiObject.handlePage(pageNumber + 1, lastPageNumber + 1);
                }
            },
            handleTrDom: function (element, lang) {
                /* 依照語系返回結構 */
                var tableTdName = '';
                var tableTdArea = '';
                var tableTdAddress = '';
                var tableTr = '';

                switch (lang) {
                    case ('zh-tw'):
                        tableTdName = '<td>' + element.cName + '</td>';
                        tableTdArea = '<td>' + element.cArea + '</td>';
                        tableTdAddress = '<td>' + element.cAddress + '</td>';
                        break;
                    case ('en'):
                        tableTdName = '<td>' + element.eName + '</td>';
                        tableTdArea = '<td>' + element.eArea + '</td>';
                        tableTdAddress = '<td>' + element.eAddress + '</td>';
                        break;
                    default:
                        break;
                }

                tableTr = '<tr>' + tableTdArea + tableTdName + tableTdAddress + '</tr>';

                return tableTr;
            },
            handleRender: function (pageNumber) {
                /* 處理表格渲染 */
                var head = pageNumber * showNumber;
                var foot = (pageNumber + 1) * showNumber;
                var tHead = lang === 'en' ? '<thead><tr><th>Area</th><th>Name</th><th>Address</th></tr></thead>' : '<thead><tr><th>區</th><th>站名</th><th>地址</th></tr></thead>';

                structureDom = tHead;
                tableWrap.innerHTML = structureDom;

                renderArray.slice(head, foot).map(ele => {

                    var tableTr = this.handleTrDom(ele, lang);

                    structureDom = structureDom + tableTr;
                });

                tableWrap.innerHTML = structureDom;
            },
            handleCountPage: function (data) {
                /* 計算應有頁數 */
                var countPage = parseFloat(data.length / 10).toString().split('.');

                lastPageNumber = countPage[1] ? parseInt(countPage[0]) : parseInt(countPage[0]) - 1;

                this.handlePage(pageNumber + 1, lastPageNumber + 1);
            },
            handleData: function (responseText) {
                /* 當api成功回傳，處理api回傳資料 */
                responseData = JSON.parse(responseText);

                /* 把responseData的資料整理成自己要的陣列格式 */
                responseData.map(element => {
                    selfArray.push({
                        cName: element.Position,
                        cAddress: element.CAddress,
                        cArea: element.CArea,
                        eName: element.EName,
                        eAddress: element.EAddress,
                        eArea: element.EArea,
                    });
                });

                /* 使用jQuery的$.extend做copy array */
                renderArray = $.extend(true, [], selfArray);

                this.handleRender(pageNumber);

                this.handleArea();

                this.handleCountPage(renderArray);
            },
            callApi: function () {
                $.ajax({
                    method: 'GET',
                    url: 'https://script.google.com/macros/s/AKfycbxs3QX-GGwWZiGEloxDiuM81fu6IXidHesQEZaGinQ7YEbMmf0/exec?url=e-traffic.taichung.gov.tw/DataAPI/api/YoubikeAllAPI',
                    dataType: 'text'
                })
                    .done(function (data) {
                        apiObject.handleData(data);
                    });
            },
            execute: function () {
                this.callApi();
                this.handleBindEvent();
            }
        }

        return apiObject;
    };

    var executeOnload = handleOnload();

    executeOnload.execute();
})();