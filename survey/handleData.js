import rules from '../public/co2-model.FR-lang.fr.json' with { type: "json" }
import Engine from 'publicodes'
import { handleInputExcel, initOutputExcel } from './helpers/utils.js';

const { inputworksheet, numberOfRow } = await handleInputExcel();
const { outputWorkbook, outputWorksheet, headerRow } = await initOutputExcel();

const engine = new Engine(rules);
for (let i = 2; i <= numberOfRow; i ++) {
    const headerInput = inputworksheet.getRow(1).values;
    const currentRow = inputworksheet.getRow(i).values;
    const situation = {};

    for (let headerIndex = 2; headerIndex <= headerInput.length; headerIndex ++) {
        if (headerInput[headerIndex] !== undefined && currentRow[headerIndex] !== "" && currentRow[headerIndex] !== undefined) {
            if (currentRow[headerIndex] === true || currentRow[headerIndex] === false) {
                situation[headerInput[headerIndex].trim()] = currentRow[headerIndex] === true ? "oui" : "non";
            } else if (currentRow[headerIndex] !== 'je ne sais pas') {
                if (typeof currentRow[headerIndex] === 'string') {
                    situation[headerInput[headerIndex].trim()] = `'${currentRow[headerIndex]}'`;
                } else {
                    situation[headerInput[headerIndex].trim()] = currentRow[headerIndex];
                }
            }
        }
    }

    engine.setSituation({ ...situation, 'transport . deux roues . type': "'moto inf 250'"});
    const computeRow = [currentRow[1]];

    for (let ruleIndex = 2; ruleIndex <= headerRow.length; ruleIndex ++) {
        const rule = headerRow[ruleIndex];
        if (rule) {
            computeRow.push(engine.evaluate(rule).nodeValue);
        } else computeRow.push(0);
    }

    outputWorksheet.addRow(computeRow);
}

await outputWorkbook.xlsx.writeFile("survey/test-output.xlsx");
