//變數區
const dataUrl = 'https://hexschool.github.io/js-filter-data/data.json';
const cropInput = document.querySelector('.crop-input input');
const search = document.querySelector('.search');
const showList = document.querySelector('.showList');
const allPage = document.querySelector('html');
const sortSelect = document.querySelector('.sort-select');
const tableThead = document.querySelector('.js-sort-advanced');
const fliterTextArray = ['上價','中價','下價','平均價','交易量'];
const pagination = document.querySelector('.pagination');
let data;
let tidyData;
let typeData;
let newData;
let str = '';
let onePageDataQuantity = 30; //一頁30資料
let pageQuantity;
let pageNumber='';
let allPagination='';
let clickPageNumber = 1;
let dataStart;
let dataEnd;
let pageNumberStart;
let pageNumberEnd;



//axios 接ＡＰＩ
const getData = () => {
    axios.get(dataUrl)
        .then(function (response) {
            // handle success
            console.log(response);
            data = response.data;
            console.log(data);
            filterNoCropName(data);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}
getData();

//三個類別其中一個變橘色,另外兩個就是白色
$(document).ready(function(){
    $('.button-group button').click(function(e){
        $(this).addClass('btn-warning').siblings().removeClass('btn-warning');
    })
})

//按enter
allPage.addEventListener('keypress',(e)=>{
    if(e.key == 'Enter'){
        checkTypeChoose();
        typeFilterTool(tidyData);
        textFilterTool(typeData);
        calcPageQuantity(newData);
        calcDataRange(clickPageNumber);
        renderList(newData,dataStart,dataEnd);
    }
})

//點擊搜尋
search.addEventListener('click',(e) => {
    backDefaultSet();
    checkTypeChoose();
    typeFilterTool(tidyData);
    textFilterTool(typeData);
    calcPageQuantity(newData);
    calcDataRange(clickPageNumber);
    renderList(newData,dataStart,dataEnd);
}) 
    
//渲染列表  
const renderList = (newData,dataStart,dataEnd)=>{
    for(let i = dataStart; i < dataEnd ; i++){
        str+=
            `
            <tr>
                <td>${newData[i].作物名稱}</td>
                <td>${newData[i].市場名稱}</td>
                <td>${newData[i].上價}</td>
                <td>${newData[i].中價}</td>
                <td>${newData[i].下價}</td>
                <td>${newData[i].平均價}</td>
                <td>${newData[i].交易量}</td>  
            </tr>
            `;
    }
    if(newData.length>0){
        allPagination = `
                    <li class="page-item js-previous">
                        <a class="page-link" data-act="js-previous" href="#" aria-label="Previous">
                            <span data-act="js-previous" aria-hidden="false">&laquo;</span>
                        </a>
                    </li>
                    ${calcPageNumStartToEnd(clickPageNumber)}
                    <li class="page-item js-next">
                        <a class="page-link" data-act="js-next"  href="#" aria-label="Next">
                            <span data-act="js-next" aria-hidden="false">&raquo;</span>
                        </a>
                    </li>
                    `
    }
    showList.innerHTML = str;
    str='';
    pagination.innerHTML = allPagination;
    pageNumber='';
    allPagination='';
    pageNextOrPreviousDisabled();
}

// 下拉篩選選單綁change監聽，使data依不同的條件重新排序
sortSelect.addEventListener('change',(e)=>{
    fliterTextArray.forEach((item)=>{
        if(e.target.value == `依${item}排序`){
            firstClickThChangeStyle(item);
            sortHightToLow(item);
        }else if(e.target.value == '排序篩選'){
            clickThNoStyle(item);
            textFilterTool(typeData);
        }
    })
    renderList(newData,dataStart,dataEnd);
})


//剔除無作物名稱的data
const filterNoCropName = (data) =>{
    tidyData = data.filter((item)=>{
        return item.作物名稱 !== '' || item.作物名稱 !== null || item.作物名稱 !== undefined;
    })
}

//種類是否有選
const checkTypeChoose = ()=>{
    if($('.button-group button').hasClass('btn-warning') == false){
            alert('請先選擇類別～～唷');
            return;
    }
}

//類別篩選
const typeFilterTool = (tidyData) => {
    typeData = tidyData.filter((item) => {
        return $('.button-group .btn-warning').attr('data-type') == item.種類代碼;
    })
    // console.log(typeData);
}

//文字篩選
const textFilterTool = (typeData) => {
    newData = typeData.filter((item) => {
        // （這個也可以）return item.作物名稱.indexOf(cropInput.value) !== -1;
        return item.作物名稱.includes(cropInput.value) == true;
    })
    if(newData.length == 0){
        str =   
                `
                <tr>
                    <td colspan="7" class="text-center">ＳＯＲＲＹ～查無資料～～～</td>
                </tr>
                `;
    }
    console.log(newData);
}

//排序函式
const sortHightToLow = (text) => {
    newData.sort((few,much) => {
        return much[text] - few[text];
    })
}
const sortLowToHight = (text) => {
    newData.sort((few,much) => {
        return few[text] - much[text];
    })
}

//<th>改變樣式
const firstClickThChangeStyle = (item)=>{
    $(document).ready(function(){
        $(`.${item}`).addClass('active');
        $(`.${item}`).siblings().removeClass('active');
        $(`.${item} .fa-caret-down`).addClass('invisible');
        $(`.${item}`).siblings().find('i').removeClass('invisible');
    })
}
const secondClickThChangeStyle = (item)=>{
    $(document).ready(function(){
        $(`.${item} .fa-caret-down`).removeClass('invisible');
        $(`.${item} .fa-caret-up`).addClass('invisible');
    })
}
const clickThNoStyle = (item)=>{
    $(document).ready(function(){
        $(`.${item} .fa-caret-up`).removeClass('invisible');
        $(`.${item} .fa-caret-down`).removeClass('invisible');
        $(`.${item}`).removeClass('active');
    })
}


//表頭項目篩選，點擊後更改排序
tableThead.addEventListener('click',(e)=>{
    fliterTextArray.forEach((item)=>{
        if(e.target.getAttribute('class') == item || 
           e.target.getAttribute('data-price') == item ||
           e.target.getAttribute('class') == `${item} active`){
            
            //1. 沒 active 的時候 ，i都是可見的。 點了有active, 下面i隱藏 ，排序：高到低
            if($(`.${item} i`).hasClass('invisible') == false ){ //上下的i都可見時
                firstClickThChangeStyle(item);
                sortHightToLow(item);
            }
            //2. 有active，上面i可見。 點了，上面i隱藏，下面i出來 排序： 低到高
            else if($(`.${item} i`).hasClass('fas fa-caret-down invisible') == true){
                secondClickThChangeStyle(item);
                sortLowToHight(item);
            }
            //3. 有active，下面i可見。再點一次，沒有active，兩個i都出來   排序:無
            else if($(`.${item} i`).hasClass('fas fa-caret-up invisible') == true){
                clickThNoStyle(item);
                textFilterTool(typeData);
            } 
        }
    })
    renderList(newData,dataStart,dataEnd);
})


//製作分頁功能
//計算頁數
function calcPageQuantity(newData){
    pageQuantity = Math.ceil(newData.length/onePageDataQuantity);
    console.log(pageQuantity);
}  

//點頁碼顯示資料
pagination.addEventListener('click',(e)=>{
    //點擊到的是頁碼
    if(parseInt(e.target.getAttribute('data-index')) <= pageQuantity){
        clickPageNumber = parseInt(e.target.getAttribute('data-index'));
    }
    //點擊 < 或 >  
    if(e.target.getAttribute('data-act') =='js-previous'){
        clickPageNumber -= 1;
    }else if(e.target.getAttribute('data-act') == 'js-next'){
        clickPageNumber += 1;
    }
    console.log(clickPageNumber); 
    calcDataRange(clickPageNumber);
    renderList(newData,dataStart,dataEnd);
})


//計算資料顯示筆數的範圍，第一頁顯示newData的0~29筆，第二頁顯示30~59筆
function calcDataRange(clickPageNumber){
    dataStart = onePageDataQuantity * (clickPageNumber - 1);
    dataEnd = onePageDataQuantity * clickPageNumber - 1;
    //假設 38 筆 ，第一頁出現 30 筆， 第二頁會出現 8 筆 
    let dataLen = newData.length; 
    if(dataEnd >= dataLen){
        dataEnd = dataEnd - (dataEnd-dataLen);
    }else if(dataEnd < dataLen){
        dataEnd = dataLen-(dataLen-dataEnd)+1;
    }
}

function calcPageNumStartToEnd(clickPageNumber){
    //預設顯示頁碼1~5，點取的頁碼會給予active樣式 
    if(pageQuantity<=5){
        pageNumberStart = 1;
        pageNumberEnd = pageQuantity;
        for(let i = pageNumberStart; i <= pageNumberEnd ; i++){
            if(i == clickPageNumber){
                pageNumber+=`<li class="page-item active"><a class="page-link" data-index="${i}" href="#">${i}</a></li>`;
            }
            if(i !== clickPageNumber){
                pageNumber+=`<li class="page-item"><a class="page-link" data-index="${i}" href="#">${i}</a></li>`;
            }
        }
        return pageNumber;
    }
    //預設顯示頁碼1~5，點取的頁碼會給予active樣式 
    /*假設 38 頁，點擊36頁，分頁是<'34'35'36'37'38'> (if)
    ，點擊37頁，分頁樣式維持一樣<'34'35'36'37'38'>，
    點擊38頁亦同。點擊末兩頁，分頁樣式不會變(else if)*/
    else if(pageQuantity>5){
        if(clickPageNumber <= 3){
            pageNumberStart = 1;
            pageNumberEnd = 5;
        }else if(clickPageNumber > 3 && clickPageNumber < pageQuantity - 1){
            pageNumberStart = clickPageNumber - 2;
            pageNumberEnd = clickPageNumber + 2;
        }else if(clickPageNumber == pageQuantity -1 || clickPageNumber == pageQuantity){
            pageNumberStart = clickPageNumber - 3;  
            pageNumberEnd = pageQuantity;
        }
        for(let i = pageNumberStart; i <= pageNumberEnd ; i++){
            if(i == clickPageNumber){
                pageNumber+=`<li class="page-item active"><a class="page-link" data-index="${i}" href="#">${i}</a></li>`;
            }
            if(i !== clickPageNumber){
                pageNumber+=`<li class="page-item"><a class="page-link" data-index="${i}" href="#">${i}</a></li>`;
            }
        }
        return pageNumber;
    }
}

function pageNextOrPreviousDisabled(){
        if(pageNumberStart == 1){
            $('.js-previous').addClass('disabled');
            $('.js-previous a').attr('tabindex','-1');
        } 
        if(pageNumberEnd == pageQuantity){
            $('.js-next').addClass('disabled');
            $('.js-next a').attr('tabindex','-1');
        }
}

function backDefaultSet(){
    sortSelect.value='排序篩選';
    allThNoStyle();
    clickPageNumber = 1;
}

function allThNoStyle(){
    fliterTextArray.forEach((item)=>{
        clickThNoStyle(item);
    })
}