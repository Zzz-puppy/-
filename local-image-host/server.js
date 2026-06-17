const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');

const port = Number(process.env.PORT || 8090);
const uploadDir = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(body));
}

function getExtension(fileName) {
  const ext = path.extname(fileName || '').toLowerCase();
  return ext && ext.length <= 10 ? ext : '.jpg';
}

function parseMultipart(req, body) {
  const contentType = req.headers['content-type'] || '';
  const matched = contentType.match(/boundary=(.+)$/);
  if (!matched) {
    throw new Error('缺少 multipart boundary');
  }

  const boundary = Buffer.from(`--${matched[1]}`);
  const start = body.indexOf(boundary);
  if (start === -1) {
    throw new Error('未找到上传文件');
  }

  let partStart = start + boundary.length + 2;
  const partEnd = body.indexOf(boundary, partStart) - 2;
  if (partEnd <= partStart) {
    throw new Error('上传文件为空');
  }

  const part = body.subarray(partStart, partEnd);
  const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
  if (headerEnd === -1) {
    throw new Error('上传格式错误');
  }

  const header = part.subarray(0, headerEnd).toString('utf8');
  const fileContent = part.subarray(headerEnd + 4);
  const fileNameMatch = header.match(/filename="([^"]*)"/);

  return {
    fileName: fileNameMatch ? fileNameMatch[1] : '',
    content: fileContent
  };
}

function handleUpload(req, res) {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    try {
      const body = Buffer.concat(chunks);
      const file = parseMultipart(req, body);
      const ext = getExtension(file.fileName);
      const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, safeName);

      fs.writeFileSync(filePath, file.content);

      const url = `http://localhost:${port}/uploads/${safeName}`;
      sendJson(res, 200, {
        code: 200,
        message: 'success',
        url,
        data: { url }
      });
    } catch (error) {
      sendJson(res, 400, {
        code: 400,
        message: error.message || '上传失败'
      });
    }
  });
}

function handleStatic(req, res) {
  const prefix = '/uploads/';
  const fileName = decodeURIComponent(req.url.slice(prefix.length));
  const filePath = path.resolve(uploadDir, fileName);

  if (!filePath.startsWith(uploadDir) || !fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/upload') {
    handleUpload(req, res);
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/uploads/')) {
    handleStatic(req, res);
    return;
  }

  sendJson(res, 200, {
    code: 200,
    message: 'local image host is running',
    uploadUrl: `http://localhost:${port}/upload`
  });
});

server.listen(port, () => {
  console.log(`Local image host running at http://localhost:${port}`);
  console.log(`Upload endpoint: http://localhost:${port}/upload`);
});