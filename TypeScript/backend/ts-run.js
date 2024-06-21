const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const tsConfig = require('./tsconfig.json');
const outDir = tsConfig.compilerOptions.outDir;

function generateTypeScriptInterface(obj, interfaceName) {
    const convertType = (type) => {
        switch (type) {
            case String:
                return 'string';
            case Number:
                return 'number';
            case Boolean:
                return 'boolean';
            case Array:
                return 'any[]';
            case Object:
                return 'any';
            default:
                return 'any';
        }
    };

    const processProperties = (obj, indent = '  ') => {
        let result = '';
        for (const [key, value] of Object.entries(obj)) {
            const type = value.type;
            const required = value.required ? '' : '?';
            let tsType;
            let defaultComment = '';

            if (value.hasOwnProperty('default')) {
                defaultComment = ` // default: ${JSON.stringify(value.default).replace(/\"/g, "'")}`;
            }

            if (type === Object && !value.enum) {
                tsType = '{\n' + processProperties(value, indent + '  ') + indent + '}';
            } else if (type === Array && !value.enum) {
                tsType = 'any[]';
            } else if (value.enum) {
                tsType = value.enum.map(v => `'${v}'`).join(' | ');
                if (type === Array) {
                    tsType += '[]';
                }
            } else {
                tsType = convertType(type);
            }

            result += `${indent}${key}${required}: ${tsType};${defaultComment}\n`;
        }
        return result;
    };

    const interfaceBody = processProperties(obj);
    const result = `// Generated: ${new Date().toLocaleString('ru-RU')}\nexport interface ${interfaceName} {\n${interfaceBody}}`;

    return result;
}

function generateTsModels() {
    const modelsDir = './models/mongo';
    const models = fs.readdirSync(modelsDir);

    let db_i = '';
    let imports = `import { Model } from 'mongoose';\n`;

    for (const model of models) {
        if (model === 'Database.js' || model === 'Database.ts') continue;

        if (model.endsWith('.js')) {
            const data = require(`${modelsDir}/${model}`);
            const name = model.replace('.js', '');

            const interface = generateTypeScriptInterface(data, name);
            fs.writeFileSync(`${modelsDir}/${model.replace('.js', '.ts')}`, interface);
            db_i += `  ${name}: Model<${name}>;\n`;
            imports += `import { ${name} } from './${name}';\n`;
        }
    }

    const db_interface = `// Generated: ${new Date().toLocaleString('ru-RU')}\n${imports}\nexport interface Database {\n${db_i}}`;
    fs.writeFileSync(`${modelsDir}/Database.ts`, db_interface);
}

generateTsModels();

exec('tsc', (error, stdout, stderr) => {
    if (error) {
        console.error(`Ошибка при компиляции: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`Сборка завершена с предупреждениями: ${stderr}`);
    }

    console.log(stdout);

    moveCompiledFiles('./controllers');
    moveCompiledFiles('./interfaces');
});

function moveCompiledFiles(dir) {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(`Ошибка при чтении директории ${dir}: ${err.message}`);
            return;
        }

        files.forEach(file => {
            if (file.isDirectory()) {
                moveCompiledFiles(path.join(dir, file.name));
            } else if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
                const jsFileName = file.name.replace('.ts', '.js');
                const srcPath = path.join(outDir, dir, jsFileName);
                const destPath = path.join(dir, jsFileName);

                fs.rename(srcPath, destPath, (err) => {
                    if (err) {
                        console.error(`Ошибка при перемещении файла ${srcPath} в ${destPath}: ${err.message}`);
                        return;
                    }

                    console.log(`Файл ${srcPath} успешно перемещен в ${destPath}`);
                });
            }
        });
    });
}