# JellyShelf · iOS / TestFlight 发布准备

更新：2026-09-28。带原创兔子图标的 `1.0.0 (3)` 已完成签名归档，并于北京时间 19:05:36（CST，UTC+8）上传 Apple 成功，日志显示 `Upload succeeded` / `EXPORT SUCCEEDED`；上传回执为 processing，后续处理完成状态未核实。此前 build 2 已完成完整软件键盘问题修复和模拟器复测。App Store Connect 的 JellyShelf 简体中文应用记录 ID 为 `6816674454`。用户已报告登录成功，地址进入 `/apps`，但代理读取后台页面持续超时；不能将此当成登录失败。尚未提交 TestFlight 外测审核、邀请测试者或正式 App Store 审核，应用未上架。图标提交 `11660f1` 已推送到 `origin/main`，Pages CI `36413425715` 部署成功，线上新图标字节与本地一致。

## 1. 当前版本与功能边界

| 项目 | 当前配置 / 发布约束 |
| --- | --- |
| 应用名称 | JellyShelf |
| App Store Connect App ID | `6816674454`（应用记录已创建，不代表已上架） |
| Bundle ID | `com.violetloveai.jellyshelf` |
| Xcode 项目 / Scheme | `ios/App/App.xcodeproj` / `App` |
| 原生版本 / 构建号 | 最新 `1.0.0 (3)` 已上传 Apple；上传回执为 processing，后续处理完成状态未核实；build 1 / 2 保留为此前上传记录 |
| npm 包版本 | `0.2.0`，不等于 App Store 版本 |
| 最低系统配置 | iOS 15.0；实际发布兼容性以最终归档和验收为准 |
| 收费 / 登录 | 免费，无 JellyShelf 账号，无应用内购买 |
| 数据 | 当前设备内保存商品、分支、照片和人工核验的成交样本；无云同步 |
| 照片 | 拍照或选图后本机保存；本机模型只比较已录入照片的外观相似度 |
| 行情 | 用户手工核验、手工录入样本；按同 SKU、尺寸、品相等条件计算样本中位数 |
| 自动采集 | 未接通 eBay / Whatnot 全市场历史成交 API 或自动抓取 |

原生包启动个人空资料库，运行代码、识别模型和 WASM 随包提供；对已保存的本机资料与照片，核心录入、检索和相似度计算不依赖云服务。官网、成交来源、GitHub 等外链，以及从备份恢复的远程官网图片，需要相应网络服务。iOS 系统备份和用户自行保存到 iCloud 的文件不是 JellyShelf 云同步。

原生包已核对：模型、WASM、隐私页和支持页齐全，无网页 demo chunk 或 Jellycat 官方商品图片文件；仅保留四款静态官网参考 URL。网页演示图片通过官方 CDN 加载。不能把“无图片文件 / 无演示图库”写成“构建中完全没有官网引用”。

照片候选不鉴定真伪、尺寸或品相，也不是 Jellycat 官方识别服务。行情不是全市场成交价，目标价不是 MSRP。首发日期、首发价和停产状态只采用可核验的品牌来源，未知留空；售罄不等于停产。

## 2. 公开链接与联系入口

| 用途 | 目标 URL | 当前核对结果 |
| --- | --- | --- |
| 个人图册网页 | [JellyShelf](https://violetloveai.github.io/jellyshelf/?app=1) | 2026-09-27 curl 开启 TLS 校验，HTTP 200 |
| 隐私政策 | [Privacy](https://violetloveai.github.io/jellyshelf/privacy.html) | 2026-09-27 curl 开启 TLS 校验，HTTP 200 |
| 支持页面 | [Support](https://violetloveai.github.io/jellyshelf/support.html) | 2026-09-27 curl 开启 TLS 校验，HTTP 200 |
| 问题反馈 | [GitHub Issues](https://github.com/violetloveAI/jellyshelf/issues) | 公开支持入口，不提交私人库存或完整备份 |

源代码提交 `f4329a5` 已推送至 `origin/main`；[Pages CI 36325347248](https://github.com/violetloveAI/jellyshelf/actions/runs/36325347248) 已 completed / success，npm test、类型检查、构建和部署步骤全部成功。上述公开 URL 已通过 HTTP 检查；线上隐私页和支持页的响应内容逐字节等于 Git 源码。App Store Connect 若要求测试反馈或审核联系资料，应由账户持有人在平台私密表单中填写真实信息；本文不保存个人邮箱、电话、团队凭据或私钥。

## 3. App Store 文案草稿

以下分别用于简体中文和英文商店资料。当前应用主要界面为简体中文，支持中英文商品名称；英文商店文案不代表应用已有完整英文界面。

### 简体中文

**名称：** JellyShelf

**副标题：** 你的本机毛绒收藏资料库

**宣传文本：** 用自己的照片整理收藏，记下货号、尺寸、品相与目标价。无需账号，本机查找，手动备份。

**描述：**

给每一只喜欢的伙伴，留一个好找的位置。

JellyShelf 是免费的个人收藏资料工具，帮助你整理毛绒公仔和挂件。无需注册，从自己的照片与记录开始。

- 记录中英文品名、货号、尺寸、品相、备注和来源链接。
- 按尺寸与品相管理分支，保存拿货价和目标成交区间，查看成本估算。
- 通过名称、货号、分类和收藏标记快速查货。
- 用照片在已录入的资料库中寻找外观相似候选，匹配在设备上进行。
- 手工保存已核验的成交样本，查看符合条件的样本中位数；没有数据时留空。
- 导出包含本机商品照片的 JSON 备份，在支持相同格式的版本中恢复或合并。

你的资料保存在当前设备，没有账号和云同步。已保存的本机资料可离线使用；外链和远程图片需要联网。换设备、清理数据或卸载前，请先保存并确认备份文件。

成本计算采用工具中的固定假设，需按实际账单核对。行情来自你核验后录入的样本，不提供 eBay 或 Whatnot 自动成交抓取，也不代表全市场价格。照片相似度不是真伪、品相或尺寸鉴定。

JellyShelf 是独立、非官方工具，与 Jellycat 无隶属或认可关系。商品名称、商标和图片权利属于各自权利人。应用主要界面为简体中文。

**关键词草稿：** 毛绒,公仔,挂件,收藏,图册,货号,库存,品相,成本,备份

### English

**Name:** JellyShelf

**Subtitle:** Your personal plush catalog

**Promotional text:** Organize your collection with your own photos, SKUs, conditions and target prices. No account. Local photo matching. Backups you control.

**Description:**

A little place for every favorite.

JellyShelf is a free personal catalog for plush toys and bag charms. Start with your own photos and records. No account is required.

- Save Chinese and English names, SKUs, sizes, conditions, notes and source links.
- Keep separate size and condition variants, purchase costs and target sale-price ranges.
- Find items by name, SKU, category or favorites.
- Compare a photo with images already saved in your catalog. Similarity matching runs on your device.
- Manually record verified sales and view the median of qualifying samples. Missing data stays blank.
- Export a JSON backup with your local product photos, then restore or merge it in a compatible version.

Your catalog stays on the current device. There is no account or cloud sync. Saved local records work offline; external links and remote images require an internet connection. Save and check your backup before changing devices, clearing data or uninstalling.

Cost estimates use fixed assumptions and should be checked against actual statements. Sale medians reflect samples you verify and enter, not the whole market. JellyShelf does not automatically retrieve eBay or Whatnot sales. Photo similarity does not authenticate an item or determine its size or condition.

JellyShelf is an independent, unofficial tool, not affiliated with or endorsed by Jellycat. Product names, trademarks and images belong to their respective rights holders. The app's primary interface language is Simplified Chinese.

**Keywords draft:** plush,collection,catalog,inventory,toys,charms,photos,condition,backup

## 4. TestFlight 素材草稿

### Beta App Description · 中文

JellyShelf 是无需账号的本机收藏资料库。此测试版用于验证商品录入、照片和分支管理、搜索、本机照片相似候选，以及含照片的 JSON 备份。行情仅统计用户手工核验后保存的成交样本，不自动抓取平台数据。原生版从空资料库开始，不提供网页演示图库。请用可丢弃的测试记录或先备份自己的资料。

### Beta App Description · English

JellyShelf is a local collection catalog with no account. This beta is intended to test product entry, photos and variants, search, on-device photo similarity and JSON backups with photos. Sale statistics use only manually verified records; platform sales are not fetched automatically. The native app starts with an empty catalog and does not include the website's demo gallery. Use disposable test records or back up your own data first. The primary interface is Simplified Chinese.

### What to Test · 中文

1. 从“录入第一款商品”或右上角加号创建记录，填写品名、货号、尺寸、品相、拿货价和目标区间；保存后编辑，再关闭并重新打开应用核对。
2. 从相册选图，覆盖“限制访问”、取消和拒绝权限的情况。只授予你愿意分享的照片；不需要为测试主动改成完整相册访问。另在真实 iPhone 测试拍照、方向和大图处理。
3. 按名称或货号搜索，切换分类和收藏；用已有商品的另一张照片检查相似候选。候选需要人工确认，结果不是鉴定。
4. 给测试记录添加可核验的单件美国美元成交样本，检查样本数量、中位数和不足提示；不要把编造记录当真实价格证据。
5. 在“我的 → 数据与备份”导出 JSON，完成系统保存后确认文件存在。选择文件、检查预览、确认合并，再抽查照片。也测试取消分享不会提示保存成功。
6. 关闭网络后检查已有本机商品、照片与相似匹配；外链和远程官网图片无法联网加载属于预期边界。

反馈请包含构建号、设备与系统、复现步骤和错误文字。通过 TestFlight 提交反馈，或到公开 GitHub Issues 留下已脱敏的问题；不要附完整备份或私人照片。

### What to Test · English

1. Add an item using the empty-state action or the plus button. Enter its name, SKU, size, condition, purchase cost and target range. Save, edit, close and reopen the app, then check the saved record.
2. Choose a photo with limited photo-library access; also test cancellation and permission denial. Share only photos you are comfortable using. Separately test capture, orientation and large photos on a real iPhone.
3. Search by name or SKU, switch categories and favorites, and compare another photo of an existing item. Confirm candidates yourself; similarity is not authentication.
4. Add verified, single-item US sales in USD to a test record and check counts, medians and low-sample notices. Do not treat invented records as price evidence.
5. Under My → Data & backup, export JSON, complete the system save action and confirm the file exists. Select it, check the preview, confirm the merge and inspect restored photos. Canceling a share must not report a successful save.
6. With the network disabled, check saved local records, photos and matching. External links and remote official images require a connection.

Include the build number, device, OS, steps and error text in feedback. Use TestFlight feedback or a redacted public GitHub issue. Do not attach full backups or private photos.

### App / Beta Review Notes · 中英

无需登录，也没有审核专用账号。启动时显示空资料库，点“录入第一款商品”或右上角加号即可建立记录。照片查找需要先给至少一款商品保存照片。初始行情为空是预期行为；详情中的“添加已核验成交”用于手工添加样本。本应用不售卖商品、不接单、不自动获取电商成交。核心逻辑和图片模型随原生包提供，用户库存不上传给我们。相册保留当前系统限制访问流程；不声称已改为免相册权限的桥接。

No sign-in or review account is required. The app opens with an empty catalog. Use the first-item action or the top-right plus button to create a record. Save a product photo before trying photo search. Empty sale statistics are expected until verified samples are manually entered in product details. The app does not sell products, take orders or automatically retrieve marketplace sales. Core logic and the image model ship in the native bundle; catalog records are not uploaded to us. Photo selection uses the current limited-library permission flow, not a new permission-free bridge.

## 5. 隐私与素材提交口径

- 无广告或用户行为分析 SDK，无 JellyShelf 云端库存。库存照片、本机模型特征和日常记录不发送给我们。
- Apple 的 TestFlight 流程会收集使用与崩溃信息并向开发者分享；用户主动提交的反馈和截图也可能分享。不能把这写成“开发者永远不会收到任何信息”。见 [TestFlight 与隐私](https://www.apple.com/legal/privacy/data/en/test-flight/)。
- App Store Connect 隐私表、依赖隐私清单和实际归档需保持一致；当前源码中没有应用自行采集库存的服务，最终平台选项应在提交前依据该构建核对。
- 只使用实际原生界面的截图，展示自有或已获授权的照片。不能用网站演示图册冒充原生版自带内容。不得声称官方合作、官方识别或已具备自动行情采集。
- 当前固定成本假设为拿货价 + $4 运费 + 目标成交价 × 16%；不能将其写成平台实时费率。

## 6. 构建与发布操作

以下命令在项目根目录执行，是操作说明，不是执行记录。需 Node.js 22.13+、完整 Xcode 和可用的 iOS 构建环境。代码不包含签名私钥；签名与上传使用 Xcode 中已配置且有权限的账户。

### 构建、同步与模拟器

```sh
npm ci
npm test
npm run build
npm run ios:sync
npx cap open ios
```

`npm run build` 输出网页到 `dist/`；`npm run ios:sync` 执行 `build:ios`，输出 `dist-native/` 后同步到 iOS。修改前端后必须重新同步，不能只运行网页构建。Xcode 中选 `App` Scheme，再选实际模拟器运行。

可选命令行模拟器构建（只构建，不等于交互验收）：

```sh
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath artifacts/DerivedData-Simulator \
  CODE_SIGNING_ALLOWED=NO build
```

包检查必须区分“没有图片文件”和“没有参考 URL”。核对 `dist-native/` 及 `ios/App/App/public/`：模型/WASM、许可、隐私与支持页齐全；无网页 demo chunk 或官方商品图片文件。可用下面的搜索定位待检查的引用，命中结果需人工判断，不能直接当成网络请求证据：

```sh
rg -l 'demo-cream-bunny|Bashful Cream Bunny|cdn11.bigcommerce' \
  dist-native/assets --glob '*.js'
```

### 签名归档与上传

先在 Xcode 核实 Bundle ID、版本、未使用过的构建号、Signing & Capabilities 和可用签名。App Store Connect 需要与 Bundle ID 对应的应用记录及上传权限。签名归档示例：

```sh
mkdir -p artifacts
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath artifacts/JellyShelf.xcarchive \
  -allowProvisioningUpdates archive
open artifacts/JellyShelf.xcarchive
```

在 Xcode Organizer 检查归档、验证并选择 App Store Connect 分发。也可使用以下不含凭据的上传配置；它沿用归档团队，不写入团队 ID、账户、密码或私钥。仅在已准备好向 Apple 上传时执行此段：

```sh
cat > artifacts/ExportOptions-upload.plist <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>signingStyle</key><string>automatic</string>
  <key>manageAppVersionAndBuildNumber</key><false/>
  <key>uploadSymbols</key><true/>
</dict></plist>
PLIST
xcodebuild -exportArchive \
  -archivePath artifacts/JellyShelf.xcarchive \
  -exportOptionsPlist artifacts/ExportOptions-upload.plist \
  -exportPath artifacts/AppStoreUpload \
  -allowProvisioningUpdates
```

这里关闭自动管理构建号，因此上传前必须自行确认该版本的构建号尚未使用；后续上传新构建时递增。上传成功后还要等待 Apple 处理并核对平台构建状态；归档成功不等于上传成功，上传成功不等于测试可用或上架。[Apple 上传构建说明](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/)

### 隐私与支持网页发布

现有 `.github/workflows/deploy.yml` 会在 `main` 更新或手动触发时构建并发布 `dist/`。当这两页已经进入远端 `main` 后，可在 GitHub Actions 手动运行，或使用已登录的 GitHub CLI：

```sh
gh workflow run deploy.yml --ref main --repo violetloveAI/jellyshelf
gh run list --workflow deploy.yml --limit 5 --repo violetloveAI/jellyshelf
curl --fail --location --head https://violetloveai.github.io/jellyshelf/privacy.html
curl --fail --location --head https://violetloveai.github.io/jellyshelf/support.html
```

以 Actions 部署结果、公开 URL 的 HTTP 响应和手机实际阅读结果为准；本地文件存在不代表已公开部署。

### TestFlight 与正式提交

1. 核对 Apple 已处理的构建，填写真实 Beta 描述、What to Test、出口合规与平台要求的联系资料。
2. 外部测试将构建加入外测组，并按平台状态提交 TestFlight App Review。首次外测构建需要完整审核，后续同版本构建仍可能需要审核。可测试且获准后才发邀请；不承诺审核时长。[Apple 外部测试说明](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)
3. 正式上架需另行完成商店版本资料、真实截图、隐私回答、年龄分级、分发地区与审核提交。TestFlight 获准不等于 App Store 已上架。

## 7. 阶段验收记录

以下交互验收依据 2026-09-27 的实际结果，使用 iPhone 17 Pro / iOS 26.5 模拟器；浏览器验收单独注明。2026-09-28 新增 build 3 图标资源检查、测试、构建与上传结果。最新 build 3 上传回执为 processing，后续处理完成状态未核实；build 1 的独立 Xcode Validate 结果保留为历史证据。上传成功不代表已获准外测，模拟器结果不能替代实机相机或真实 TestFlight 安装结果。

| 项目 | 状态 | 构建 / 设备 / 证据 |
| --- | --- | --- |
| 单元测试 | 通过 | 26 项测试全部通过；主任务验收回报 |
| 生产依赖审计 | 通过 | audit 发现 0 项漏洞；仅指本次生产依赖审计范围 |
| 网页与原生构建 | 最终构建通过 | 2026-09-28 web / native build 均成功；build 3 已成功归档并上传 |
| 空库、商品保存与展示 | 模拟器通过 | iPhone 17 Pro / iOS 26.5 |
| 键盘附件栏下编辑框安全区 | 模拟器通过 | iPhone 17 Pro / iOS 26.5 |
| 完整软件键盘下焦点字段可见性 | 最终无调试包复测通过 | 输入框和保存按钮同时可见；根因涉及 `transition: all 0.2s`，已限制为 opacity / transform 并加入 ResizeObserver 与有界 settle |
| 终止并重新启动后的持久化 | 模拟器通过 | `simctl terminate` 后 `launch`，商品与照片仍在 |
| 完整编辑与删除 | 待最终反馈 | 未确认项不推定通过 |
| SKU 分支与官方资料隔离 | 浏览器实测通过 | 不同 SKU 分支事实隔离，草稿切换品相后清空对应未保存内容 |
| SKU 搜索与详情分支对应 | 浏览器实测通过 | 搜索测试货号 `QA-B`，详情自动打开对应分支 |
| 其他名称搜索、分类、收藏场景 | 待最终反馈 | 不从单一 SKU 搜索结果推定全部场景通过 |
| 相册限制访问选图 | 模拟器通过 | 选择 limited 照片后成功选取并保存商品 |
| 相册取消与拒绝 | 待最终反馈 | 待填 |
| 真机相机、照片方向、大小限制 | 尚未实机测试 | 模拟器选图不能替代真实摄像头测试 |
| 本机照片相似匹配 | 模拟器通过 | 从相册选取已有测试商品照片，返回该商品候选，相似度 1.00；界面保留人工确认提示，不代表识别准确率 100% |
| 断网使用 | 待最终反馈 | 待确认断网启动、本机照片读取与匹配 |
| 成本区间计算 | 实测通过 | 拿货价 $6.50、目标 $20–30，按 `6.5 + 4 + (20…30) × 16%` 得到 $13.70–15.30 |
| 核验样本中位数及无数据界面 | 待最终交互反馈 | 已有单元测试结果不替代未回报的完整界面验收 |
| 原生备份保存到“文件” | 模拟器通过 | 系统分享 → Save to Files；本机 JSON 约 224 KB，文件保存且成功回调 |
| 原生文件选择器导入与预览 | 模拟器通过 | 重新选择导出的约 224 KB JSON，预览为 1 款商品 / 1 张照片 |
| 已有同 ID 商品合并 | 模拟器通过 | 确认合并后跳过已有 1 项，未覆盖本机记录 |
| 备份取消、向空库恢复新增商品与照片 | 待最终反馈 | 已有记录跳过测试不等于已验证空库完整恢复 |
| 原生包资源与演示素材边界 | 通过 | 模型 / WASM / 隐私 / 支持齐全；无 demo chunk 或官方图片文件，仅四个静态参考 URL 保留 |
| 源代码发布 | 已推送 | `f4329a5` 已推送到 `origin/main` |
| Pages 部署 | 成功 | CI `36325347248` 已 completed / success；测试、类型检查、构建、部署步骤全部成功 |
| 个人图册 / 隐私 / 支持公开 URL | HTTP 与内容检查通过 | curl 开启 TLS 校验，三处均 HTTP 200；隐私页、支持页线上内容逐字节等于 Git 源码 |
| 应用内隐私 / 支持页返回 | 待最终交互反馈 | 不用 HTTP 检查代替原生返回路径实测 |
| build 1 签名归档与分发导出 | 通过 | `1.0.0 (1)` archive 签名及 `app-store-connect` export 成功，随后上传成功 |
| 先前 Xcode Validate | 通过 | 真实界面显示 “App 1.0.0 (1) validated”，并显示通过全部 validation checks；这不是 App Review 通过 |
| build 2 修复、构建与签名归档 | 通过 | `1.0.0 (2)` 最终无调试包的键盘复测、web / native 构建与 archive 成功 |
| App Store Connect 应用记录 | 已创建 | JellyShelf，主要语言简体中文，App ID `6816674454` |
| build 1 上传 Apple | 成功 | 2026-09-27 21:58 CST（UTC+8）；日志 `Upload succeeded` / `EXPORT SUCCEEDED`；Organizer 显示 `Uploaded to Apple` |
| build 2 上传 Apple | 成功 | 2026-09-27 22:17:45 CST（UTC+8）；日志 `Upload succeeded` / `EXPORT SUCCEEDED`；archive 2 的 Info.plist / Distributions 记录 `adamId=6816674454`、`uploadedBuildNumber=2`、`uploadEvent.state=success` |
| Apple build 2 处理与可测试状态 | 上传回执为 processing | 后续处理完成与可测试状态未核实 |
| build 3 图标、签名归档与上传 | 成功 | 2026-09-28 19:05:36 CST；archive、codesign 验证通过，上传日志显示 `Upload succeeded` / `EXPORT SUCCEEDED`；回执为 processing，尚未核实可测试状态 |
| App Store Connect 网页控制 | 页面读取超时 | 2026-09-28 用户报告登录成功，浏览器地址已进入 `/apps`；DOM 和辅助功能读取均超时，不能以此断定登录失败。需恢复浏览器读取连接后核对平台状态，无需重复索要上架授权 |
| TestFlight 外测审核 | 尚未提交 | build 3 已上传，但尚未提交外测审核 |
| 测试邀请 / TestFlight 实际安装 | 尚未邀请 | 等待构建可测试后的实际结果 |
| App Store 审核 / 公开上架 | 待后续实际提交 | 待填 |

后续填写模板：`日期；提交版本与构建号；设备与系统；步骤；实际结果；脱敏日志或截图路径；未解决限制`。不要用预期结果填充“实际结果”。

## 8. 原创 App 图标（2026-09-28）

用户授权自主设计头像后，使用内置 imagegen 生成奶油色垂耳兔与陶土收藏格图标。原始图像与完整提示词保存在 `output/imagegen/jellyshelf-bunny-cubby-v1.png` 和同名 `.prompt.txt`；未使用品牌标志或现有商品照片。内置工具输出 1254 × 1254、无 alpha 的 PNG，经 `scripts/generate-ios-art.swift` 调用 macOS `sips` 生成 iOS 1024、网页 192 / 512 和 Apple Touch 180 像素资源，均无 alpha。系统负责原生图标圆角裁切；源图保持完整方形。

新图标已接入 Xcode AppIcon、网页 favicon、manifest 与 Apple Touch 图标。启动页仍保留四瓣花标记。资源提交 `11660f1` 已推送到 `origin/main`。本轮 26 项测试、网页构建、原生构建与同步、build 3 签名归档及 `codesign --verify --deep --strict` 均通过；图片尺寸、透明度及资源路径已独立复核。本次只变更视觉资源、构建号与资源生成脚本，没有新增库存或行情功能，也没有将先前待完成的实机测试标为通过。

Pages CI `36413425715` 已 completed / success，线上 `icon-192.png` 与本地文件逐字节相同，线上 manifest 已引用 192 / 512 PNG。build 3 上传日志为 `/tmp/jellyshelf-upload3.log`，归档为 `artifacts/JellyShelf-1.0.0-3.xcarchive`。页面读取仍不可用，因此没有声称构建已可测试、已提交审核或已发送邀请。
