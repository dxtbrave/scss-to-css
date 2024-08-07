const sass = require("dart-sass");
const fs = require("fs");
const path = require("path");

// 获取当前工作目录
const cwd = process.cwd();

// 输入和输出文件的绝对路径
const inputDirPath = path.resolve(cwd, "scss");
const outputDirPath = path.resolve(cwd, "css");

// 检查输出目录是否存在，如果不存在则创建
if (!fs.existsSync(outputDirPath)) {
  fs.mkdirSync(outputDirPath);
}

// 递归遍历目录中的所有文件
function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walk(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
}

// 获取所有 .scss 文件的完整路径列表
const scssFiles = walk(inputDirPath).filter((file) => /\.scss$/.test(file));

// 遍历所有 .scss 文件并编译为 .css
scssFiles.forEach((scssFile) => {
  const relativePath = path.relative(inputDirPath, scssFile);
  const cssFile = path.join(
    outputDirPath,
    relativePath.replace(/\.scss$/, ".css")
  );

  // 确保目标目录存在
  const targetDir = path.dirname(cssFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 编译 SCSS 到 CSS
  const result = sass.renderSync({
    file: scssFile,
    outFile: cssFile,
    outputStyle: "expanded", // 或者使用 'compressed' 以得到压缩后的 CSS
  });

  // 添加 @charset 指令到结果中
  const cssWithCharset = `@charset "UTF-8";\n${result.css.toString()}`;

  // 写入结果到输出文件
  fs.writeFile(cssFile, result.css, (err) => {
    if (err) {
      console.error(`Error writing to CSS file: ${cssFile}`, err);
      return;
    }
    console.log(`Compiled "${scssFile}" to "${cssFile}".`);
  });
});
