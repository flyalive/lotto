/**
 * Korean Lunar Calendar를 이용한 로또 데이터 음력 변환기
 * lotto_data.json 파일의 양력 날짜를 음력으로 변환하여 새로운 JSON 파일 생성
 */

const fs = require('fs');
const KoreanLunarCalendar = require('korean-lunar-calendar');

console.log('🌙 Korean Lunar Calendar를 이용한 로또 데이터 음력 변환 시작...\n');

// JSON 파일 읽기
function loadLottoData() {
    try {
        const data = fs.readFileSync('lotto_data.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ lotto_data.json 파일 읽기 오류:', error.message);
        process.exit(1);
    }
}

// 양력을 음력으로 변환하는 함수
function convertToLunar(solarDateString) {
    try {
        // YYYY-MM-DD 형태의 날짜 문자열을 파싱
        const [year, month, day] = solarDateString.split('-').map(Number);
        
        // KoreanLunarCalendar 객체 생성
        const calendar = new KoreanLunarCalendar();
        
        // 양력 날짜 설정
        calendar.setSolarDate(year, month, day);
        
        // 음력 변환 결과 가져오기
        const lunarDate = calendar.getLunarCalendar();
        
        return {
            lunar_year: lunarDate.year,
            lunar_month: lunarDate.month,
            lunar_day: lunarDate.day,
            is_leap_month: lunarDate.isLeapMonth,
            lunar_date_string: `${lunarDate.year}-${String(lunarDate.month).padStart(2, '0')}-${String(lunarDate.day).padStart(2, '0')}`
        };
    } catch (error) {
        console.error(`❌ 날짜 변환 오류 (${solarDateString}):`, error.message);
        return null;
    }
}

// 로또 데이터에 음력 정보 추가
function addLunarInfoToLottoData(lottoData) {
    console.log(`📊 총 ${lottoData.length}개의 로또 데이터 변환 중...\n`);
    
    const convertedData = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < lottoData.length; i++) {
        const draw = lottoData[i];
        const progress = Math.floor((i / lottoData.length) * 100);
        
        // 진행률 표시 (10% 단위)
        if (i % Math.floor(lottoData.length / 10) === 0) {
            console.log(`⏳ 진행률: ${progress}% (${i}/${lottoData.length})`);
        }
        
        // 음력 변환
        const lunarInfo = convertToLunar(draw.date);
        
        if (lunarInfo) {
            // 기존 데이터에 음력 정보 추가
            const enhancedDraw = {
                ...draw,
                lunar_info: lunarInfo
            };
            convertedData.push(enhancedDraw);
            successCount++;
        } else {
            // 변환 실패 시 원본 데이터만 추가
            convertedData.push(draw);
            errorCount++;
        }
    }
    
    console.log(`\n✅ 변환 완료!`);
    console.log(`📈 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
    return convertedData;
}

// 변환된 데이터를 새로운 JSON 파일로 저장
function saveLunarLottoData(data) {
    try {
        const outputFileName = 'lotto_data_korean_lunar.json';
        const jsonString = JSON.stringify(data, null, 2);
        
        fs.writeFileSync(outputFileName, jsonString, 'utf8');
        
        console.log(`\n💾 저장 완료: ${outputFileName}`);
        console.log(`📁 파일 크기: ${(fs.statSync(outputFileName).size / 1024).toFixed(2)} KB`);
        
        return outputFileName;
    } catch (error) {
        console.error('❌ 파일 저장 오류:', error.message);
        return null;
    }
}

// 변환 결과 요약 출력
function printSummary(data) {
    console.log('\n📋 변환 결과 요약:');
    console.log('==================');
    
    // 연도별 통계
    const yearStats = {};
    data.forEach(draw => {
        if (draw.lunar_info) {
            const year = draw.lunar_info.lunar_year;
            yearStats[year] = (yearStats[year] || 0) + 1;
        }
    });
    
    console.log('\n🗓️ 음력 연도별 분포:');
    Object.keys(yearStats).sort().forEach(year => {
        console.log(`   ${year}년: ${yearStats[year]}회`);
    });
    
    // 윤달 통계
    const leapMonthCount = data.filter(draw => 
        draw.lunar_info && draw.lunar_info.is_leap_month
    ).length;
    
    console.log(`\n🌙 윤달 추첨: ${leapMonthCount}회`);
    
    // 샘플 데이터 출력
    console.log('\n📝 변환 샘플 (처음 3개):');
    data.slice(0, 3).forEach(draw => {
        if (draw.lunar_info) {
            console.log(`   ${draw.draw_no}회: ${draw.date} → ${draw.lunar_info.lunar_date_string} ${draw.lunar_info.is_leap_month ? '(윤달)' : ''}`);
        }
    });
}

// 메인 실행 함수
function main() {
    try {
        // 1. 로또 데이터 로드
        const lottoData = loadLottoData();
        
        // 2. 음력 정보 추가
        const convertedData = addLunarInfoToLottoData(lottoData);
        
        // 3. 새로운 JSON 파일로 저장
        const outputFile = saveLunarLottoData(convertedData);
        
        if (outputFile) {
            // 4. 결과 요약 출력
            printSummary(convertedData);
            
            console.log('\n🎉 음력 변환 작업이 성공적으로 완료되었습니다!');
            console.log(`📂 생성된 파일: ${outputFile}`);
        }
        
    } catch (error) {
        console.error('❌ 프로그램 실행 오류:', error.message);
        process.exit(1);
    }
}

// 프로그램 실행
main(); 