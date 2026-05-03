# Vditor Image API

This document describes the backend APIs recommended for full Vditor image support in the blog editor.

The frontend can already work with the current `POST /blog/images` endpoint by converting the existing `ResponseResult<BlogPictureVO>` response into Vditor's expected upload response in `upload.format`. The native endpoints below are recommended to support multi-file upload and remote-image transfer without frontend response adaptation.

## Current Compatible API

### POST `/blog/images`

Upload one image and return the existing `BlogPictureVO`.

Request:

| Field | Required | Description |
| --- | --- | --- |
| `file` | yes | One image file. Supported types: `jpg`, `jpeg`, `png`, `webp`, `gif`. Max 10 MB. |

Required headers:

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | yes | Bearer token when login is required. |
| `X-User-Id` | yes | Current user ID. |

Response:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "10",
    "blogId": null,
    "url": "https://minio.example.com/blog-images/blog/1/202605/uuid.png",
    "contentType": "image/png",
    "size": 20480,
    "originalFilename": "diagram.png",
    "createTime": "2026-05-04T12:00:00"
  }
}
```

Frontend Vditor conversion target:

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "errFiles": [],
    "succMap": {
      "diagram.png": "https://minio.example.com/blog-images/blog/1/202605/uuid.png"
    }
  }
}
```

## Recommended Native Vditor Upload API

### POST `/blog/images/vditor`

Upload one or more images using Vditor's default multipart shape.

Content type: `multipart/form-data`

Request:

| Field | Required | Description |
| --- | --- | --- |
| `file[]` | yes | One or more image files. Supported types: `jpg`, `jpeg`, `png`, `webp`, `gif`. Max 10 MB per file. |

Required headers:

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | yes | Bearer token when login is required. |
| `X-User-Id` | yes | Current user ID. |

Success response:

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "errFiles": [],
    "succMap": {
      "diagram.png": "https://minio.example.com/blog-images/blog/1/202605/uuid.png"
    },
    "pictures": [
      {
        "id": "10",
        "url": "https://minio.example.com/blog-images/blog/1/202605/uuid.png",
        "originalFilename": "diagram.png"
      }
    ]
  }
}
```

Partial failure response:

```json
{
  "code": 0,
  "msg": "部分文件上传失败",
  "data": {
    "errFiles": ["too-large.png"],
    "succMap": {
      "diagram.png": "https://minio.example.com/blog-images/blog/1/202605/uuid.png"
    },
    "pictures": [
      {
        "id": "10",
        "url": "https://minio.example.com/blog-images/blog/1/202605/uuid.png",
        "originalFilename": "diagram.png"
      }
    ]
  }
}
```

Full failure response:

```json
{
  "code": 1,
  "msg": "图片上传失败",
  "data": {
    "errFiles": ["diagram.png"],
    "succMap": {},
    "pictures": []
  }
}
```

## Recommended Remote Image Transfer API

### POST `/blog/images/link`

Transfer an external image URL to the blog image storage. This endpoint is used by Vditor's `linkToImgUrl` option when pasted Markdown or HTML contains remote images.

Content type: `application/json`

Request:

```json
{
  "url": "https://example.com/a.png"
}
```

Required headers:

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | yes | Bearer token when login is required. |
| `X-User-Id` | yes | Current user ID. |

Success response:

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "originalURL": "https://example.com/a.png",
    "url": "https://minio.example.com/blog-images/blog/1/202605/a.png",
    "pictureId": "11"
  }
}
```

Failure response:

```json
{
  "code": 1,
  "msg": "远程图片转存失败",
  "data": {
    "originalURL": "https://example.com/a.png",
    "url": ""
  }
}
```

## Delete Uploaded Image

Continue to use the existing endpoint:

### DELETE `/blog/images/{id}`

Deletes an uploaded image. Only the uploader can delete it.

Required headers:

| Header | Required | Description |
| --- | --- | --- |
| `Authorization` | yes | Bearer token when login is required. |
| `X-User-Id` | yes | Current user ID. |

Response:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

## Notes

- `succMap` keys should be the original filenames Vditor displays as image alt text.
- `succMap` values must be public image URLs that can be embedded directly in Markdown.
- For native Vditor compatibility, use `code: 0` for success and `code: 1` for failure.
- The blog save API should keep accepting `pictureIds` so uploaded images can be bound to the final blog record.
