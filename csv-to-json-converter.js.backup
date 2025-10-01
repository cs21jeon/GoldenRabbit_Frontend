const fs = require('fs');
const path = require('path');

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const record = {
      id: `rec${Date.now()}${i}`,
      fields: {}
    };
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      if (value && !isNaN(value) && value !== '') {
        record.fields[header] = parseFloat(value);
      } else {
        record.fields[header] = value;
      }
    });
    
    records.push(record);
  }
  
  return records;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

const csvFiles = {
  'all_properties.csv': 'all_properties.json',
  'high_yield_properties.csv': 'high_yield_properties.json', 
  'reconstruction_properties.csv': 'reconstruction_properties.json',
  'low_cost_properties.csv': 'low_cost_properties.json'
};

const csvDir = '/home/sftpuser/www/csv_exports';
const backupDir = '/home/sftpuser/www/airtable_backup';

Object.entries(csvFiles).forEach(([csvFile, jsonFile]) => {
  const csvPath = path.join(csvDir, csvFile);
  
  if (fs.existsSync(csvPath)) {
    try {
      console.log(`${csvFile} 변환 중...`);
      
      const csvText = fs.readFileSync(csvPath, 'utf8');
      const records = parseCSV(csvText);
      
      const backupData = {
        timestamp: new Date().toISOString(),
        total_count: records.length,
        source: 'csv_export',
        records: records
      };
      
      fs.writeFileSync(
        path.join(backupDir, jsonFile),
        JSON.stringify(backupData, null, 2)
      );
      
      console.log(`✓ ${jsonFile} 생성 완료 (${records.length}개 레코드)`);
      
    } catch (error) {
      console.error(`${csvFile} 변환 실패:`, error);
    }
  } else {
    console.log(`⚠ ${csvFile} 파일이 없습니다.`);
  }
});

console.log('\n백업 완료! 웹사이트를 확인해보세요.');
