# 用户 main 元数据保留（只在开发分支）

2026-11-02 02:02 UTC 经授权连接器双向 compare，只读main `87ca28d03fe644871af590e4d2012fb478b4e60e` 与开发`9d9bd891c84724220d11135ec1e887b3e39c4df4`：共同祖先`1b6e1a50242ff0e8de4166b4335a08957b115c2b`；main领先5/落后3，分叉。main相对共同祖先的唯一净文件差是release.json，R146-fix改为R158；开发后三提交是东南双层/东中/西中，保持全部累计。

父明确批准：下一开发后继精确继承用户release.json完整字节，不merge/main写入/回滚，不改变用户分支祖先。目标文件原文为：
```json
{
  "release": "R158"
}
```
末尾换行保留。唯一发布身份输入变化为该文件；src/data/tests/scripts/public与ebe/9d9逐树相同。单次独立/tmp clean构建用于验证R158身份，不重跑World，不以元数据改动声称新增功能验收。后继单父仍为已回读9d9，main用户后续变化仍须推送前只读复核。
