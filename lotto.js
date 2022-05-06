'use strict';
function lottoNum () {
    let numArr = [];

    for (let i=0; i<6; i++) {
        let num = Math.floor(Math.random() * 45 + 1 );

        for (let j in numArr) {
            if (num === numArr[j]){
            num = Math.floor(Math.random() * 45 )+ 1;
            }
        };

    numArr.push(num)
    }

    // 배열을 오름차순으로 정리하기,
    numArr.sort(function (a,b) {
    return a-b;
    })
    return numArr;

}
lottoNum();

document.write(`이번주의 메인 로또 추천번호는 : `, lottoNum());
