# 本地图床

用于本地测试小程序发布商品图片。前端会把图片上传到这里，服务返回一个本地 HTTP 图片链接，然后再把这个链接作为 `imageUrl` 发给后端。

## 启动

```powershell
node server.js
```

默认端口：`8090`

上传接口：`http://localhost:8090/upload`

图片访问目录：`http://localhost:8090/uploads/文件名`

## 注意

- 只适合微信开发者工具本地测试。
- 真机、正式小程序不能用 `localhost`。
- 重启服务不会删除已上传图片，图片会保存在 `uploads` 目录。