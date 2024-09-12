const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const csv = require('csv-parser');

const app = express();
const port = 4000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 使用当前时间戳作为文件名
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('fileToUpload'), (req, res) => {
    const filePath = req.file.path;
    const processedFolder = path.join(__dirname, 'processed', path.basename(filePath, path.extname(filePath)));
    const outputZip = path.join(__dirname, 'processed', `${path.basename(filePath, path.extname(filePath))}.zip`);

    if (!fs.existsSync(processedFolder)) {
        fs.mkdirSync(processedFolder, { recursive: true });
    }


    const processFile = (filePath, processedFolder, callback) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                results.forEach(row => {
                    const grade = row['目前年级'];
                    const wechatId = row['您的微信昵称（方便发您计划）'];
                    const sttgrd = row['是否已经开始学习英语'];
                    let code = '';
                    let sourceFile = '';
                    
                    if (row['语文成绩'] >= 96) {
                        code += '1';
                    } else if (row['语文成绩'] <= 95 && row['语文成绩'] >= 90) {
                        code += '2';
                    } else {
                        code += '3';
                    }                    

                    if (row['数学成绩'] >= 96) {
                        code += '1';
                    } else if (row['数学成绩'] <= 95 && row['数学成绩'] >= 90) {
                        code += '2';
                    } else {
                        code += '3';
                    }    

                    if (row['英语成绩'] >= 96) {
                        code += '1';
                    } else if (row['英语成绩'] <= 95 && row['英语成绩'] >= 90) {
                        code += '2';
                    } else {
                        code += '3';
                    }    

                    if (['中班', '小班', '大班', '幼小衔接', '初一', '初二', '初三', '高一', '高二', '高三'].includes(grade)) {
                        sourceFile = `${grade}学习计划.xlsx`;
                    } else if (['1年级', '2年级'].includes(grade)){
                        sourceFile = `${sttgrd}${grade[0]}年级学习计划done.xlsx`
                    } else {
                        sourceFile = `${code}${grade[0]}年级学习计划done.xlsx`;
                    }

                    const sourcePath = path.join(__dirname, 'source', sourceFile);
                    const targetFile = `${grade}学习计划-${wechatId}.xlsx`;
                    const targetPath = path.join(processedFolder, targetFile);

                    try {
                        fs.copyFileSync(sourcePath, targetPath);
                        console.log(`File copied: ${targetPath}`);
                    } catch (err) {
                        console.error(`Error while copying ${sourcePath} to ${targetPath}:`, err);
                    }
                });
                callback();
            });
    };

    processFile(filePath, processedFolder, () => {
        const output = fs.createWriteStream(outputZip);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            res.download(outputZip, err => {
                if (err) {
                    res.status(500).send('Error downloading file');
                } else {
                    fs.unlinkSync(filePath);
                    fs.rmdirSync(processedFolder, { recursive: true });
                    fs.unlinkSync(outputZip);
                }
            });
        });

        archive.on('error', err => {
            throw err;
        });

        archive.pipe(output);
        archive.directory(processedFolder, false);
        archive.finalize();
    });
});

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 文件管理系统的存储设置
const sourceStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'source/'); // 上传的文件存储在 source 目录中
    },
    filename: function (req, file, cb) {
        cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); // 处理文件名编码
    }
});

// const sourceUpload = multer({ storage: sourceStorage });

app.use(express.json());

// 获取文件列表
app.get('/files', (req, res) => {
    fs.readdir('source', (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        res.json(files.map(file => encodeURIComponent(file))); // 编码文件名以避免传输问题
    });
});

// 处理文件上传的 POST 请求（文件管理系统）
// app.post('/source-upload', sourceUpload.array('files', 10), (req, res) => { // 允许最多上传10个文件
//     res.send('Files uploaded successfully!');
// });

// 处理文件删除的 POST 请求（文件管理系统）
app.post('/delete', (req, res) => {
    const fileName = decodeURIComponent(req.body.fileName); // 解码文件名
    const filePath = path.join('source', fileName);
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send('File delete failed!');
        }
        res.send('File deleted successfully!');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


