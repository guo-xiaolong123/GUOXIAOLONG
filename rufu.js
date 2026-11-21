/* ============================================================
   运河儒风 · 智能讲解与行程定制（挂载在原版六页之上，不改动原有功能）
   - 行程定制：按兴趣 / 时间 / 人群 / 情境生成路书
   - 智能讲解：到站讲解要点、随走随问、分人群话术、多语种
   - 拍照识景：内置示范样本，识别结果为演示数据
   - 收藏 / 足迹 / 常用路线：仅保存在本机浏览器
   ============================================================ */
(function () {
  "use strict";

  var KEY = "rufu.v1";

  /* ---------------- 静态词表 ---------------- */
  var REGIONS = {
    qf:    { name: "曲阜 · 儒家礼乐", emoji: "🏯", line: "从一扇门、一处庭院，看见礼的形状。" },
    canal: { name: "济宁 · 运河市井", emoji: "⛵", line: "沿码头读一份货单，听水路上的生意经。" },
    lake:  { name: "湖区 · 湖岸生灵", emoji: "🌾", line: "循着苇丛与鸟影，记下湖岸的呼吸。" }
  };
  var GROUPS = {
    solo:  { name: "自由行旅人", tip: "讲解偏观察线索与典故，节奏自定。" },
    kid:   { name: "亲子家庭",   tip: "每站附一句讲给孩子听的话，每两站留出补水休息时间。" },
    study: { name: "研学小队",   tip: "每站都有可当堂收的记录任务，方便带队老师验收。" }
  };
  var WEATHERS = {
    normal: { name: "常规出游" },
    rain:   { name: "雨天 · 室内优先" },
    busy:   { name: "节假日 · 避开热点" }
  };
  var LANGS = { zh: "中文", en: "English", ja: "日本語" };
  var BUDGETS = [
    { v: 60,  n: "轻游 1 小时" },
    { v: 120, n: "漫游 2 小时" },
    { v: 240, n: "半日 4 小时" }
  ];

  /* ---------------- 站点库（泛指与模拟素材） ---------------- */
  var STOPS = [
    /* —— 曲阜 · 儒家礼乐 —— */
    { id: "qf1", region: "qf", name: "万仞宫墙 · 明故城", emoji: "🏯", visit: 20, gap: 10, inside: false, hot: true,
      ticket: "免费（登城墙另购）",
      intro: "站在城门正中向前看，门洞一层套一层。礼制建筑常用“门”的层数，提示来者所处的秩序位置。",
      solo: "抬头读“万仞宫墙”四字：古人用“仞”来夸一个人的学问之高，比直接称颂更含蓄。",
      kid: "小手比一比：从城墙根走到门洞，一共要穿过几道门？数出来告诉同行的人。",
      study: "记录门、墙、路的位置，画一条中轴线，说明它在整座城的地位。",
      en: "Stand on the axis of the old city wall and count the gateways you pass: ritual architecture uses gates to signal order.",
      ja: "旧城壁の軸線上に立ち、門の数を数えましょう。礼制建築は「門」で秩序を表します。" },
    { id: "qf2", region: "qf", name: "孔庙", emoji: "🏛️", visit: 90, gap: 12, inside: false, hot: true,
      ticket: "联票 ¥140（三孔）",
      intro: "九进院落沿中轴线展开。抬头看屋顶：庑殿、歇山、攒尖，越靠近核心规格越高。",
      solo: "大成殿前的雕龙石柱与杏坛，是“祭祀”与“讲学”两条线索的交汇处，先看再听讲解会更有味。",
      kid: "找一找梁上和柱上藏着的龙，比谁先数出三条，说说它们朝哪个方向。",
      study: "沿中轴线标注前殿、正殿、后寝的功能，解释为什么祭祀与讲学放在同一组院落里。",
      en: "The temple unfolds in nine courtyards along one axis. Watch how roof types rise in rank toward the main hall.",
      ja: "九つの庭が軸線上に並びます。中心に近づくほど屋根の格式が上がる点に注目。" },
    { id: "qf3", region: "qf", name: "孔府", emoji: "🏡", visit: 60, gap: 6, inside: false, hot: false,
      ticket: "联票 ¥140（三孔）",
      intro: "前衙后宅的布局把办公与居住分开。进门后的影壁与“戒贪图”，是最直白的一课。",
      solo: "从大堂走到内宅，注意门第、家具与动线的差别，这就是“衙”与“家”的分界。",
      kid: "找一找宅门里的石狮和门墩，猜猜哪一扇门只有家里人可以走。",
      study: "画出“前衙后宅”的简单平面图，标出对外与对内两条动线。",
      en: "The mansion separates office at the front from family life at the rear; a screen-wall painting warns officials against greed.",
      ja: "前衙後宅の構成。影壁の「戒貪図」が役人への戒めを伝えます。" },
    { id: "qf4", region: "qf", name: "孔子博物馆", emoji: "🏛️", visit: 90, gap: 15, inside: true, hot: false,
      ticket: "免费（需预约）",
      intro: "展线以“孔子的时代—孔子的一生—孔子的智慧”推进。进门先领一份导览图，再决定动线。",
      solo: "展柜里的礼器与竹简，把书上的“礼”变成了能看清尺寸的实物。",
      kid: "挑一件你觉得最有趣的文物，用三句话讲给同行的人听。",
      study: "任选一件器物，记录用途与材质，说明它反映了怎样的礼制生活。",
      en: "Galleries follow theme, life and thought. Pick one ritual object and read its label to see ritual in physical form.",
      ja: "「時代・生涯・智慧」の順に展示が進みます。礼器を一つ選び、用途を読み取りましょう。" },
    { id: "qf5", region: "qf", name: "孔林", emoji: "🌳", visit: 60, gap: 15, inside: false, hot: false,
      ticket: "联票 ¥140（三孔）",
      intro: "神道两侧古柏成行。园内以“林”为名，是延续时间很长、规模很大的家族墓地。",
      solo: "于氏坊与相传为子贡手植的楷树，讲的是弟子对老师的记挂。",
      kid: "听一听风吹柏树叶的声音，找一处最安静的地方，安静站一分钟。",
      study: "观察墓碑形制的差异，记录两三种，谈谈家族与时代的关联。",
      en: "A cemetery named as a grove: the cypress avenue and memorial arches tell how students remembered their teacher.",
      ja: "神道のヒノキ並木と牌坊。弟子が師を偲んだ場所です。" },
    { id: "qf6", region: "qf", name: "孔子研究院 · 儒家文化小展", emoji: "📜", visit: 26, gap: 8, inside: true, hot: false,
      ticket: "免费（部分展区需预约）",
      intro: "室内小展用一条时间轴梳理儒学流变，出发前先花二十多分钟打个底。",
      solo: "拾起一条你原先不知道的线索，带着它去逛孔庙，看展会更具体。",
      kid: "在展板上找一个你认识的字，说说最开始是从哪里学到的。",
      study: "用五分钟列出三个关键词，之后在孔庙、孔府各找一个对应物。",
      en: "A compact indoor exhibition on the timeline of Confucian thought; carry one new clue to the temple.",
      ja: "儒学の流れをコンパクトに紹介する屋内展示。廟を見る前の下ごしらえに。" },
    { id: "qf7", region: "qf", name: "尼山圣境", emoji: "🏔️", visit: 120, gap: 40, inside: false, hot: true,
      ticket: "约 ¥100 起（夜场演出另计）",
      intro: "在孔子诞生地看一场山水与灯光合演的礼乐场景，白天读建筑，夜晚看演出。",
      solo: "先看大学堂的轴线，再看夜色落在水面上——同一条线，两种时间感。",
      kid: "数一数台阶一共有多少级，猜猜古人为什么要修这么多。",
      study: "记录一处礼乐仪式的动作顺序，说明它想传达什么。",
      en: "At the birthplace of Confucius, read the hall by day and watch the ritual show by night.",
      ja: "孔子生誕の地。昼は建築を、夜はライトアップの儀礼を味わいます。" },
    { id: "qf8", region: "qf", name: "石门山", emoji: "🌄", visit: 90, gap: 35, inside: false, hot: false,
      ticket: "约 ¥30（季节浮动）",
      intro: "山谷林径与摩崖石刻并存，走一段就换一种视野，适合避开发热景点。",
      solo: "挑一处石刻读它的年代，再抬头看山形，两个字：耐看。",
      kid: "找一块长得最像小动物的石头，给它取个名字。",
      study: "记录沿途植被的三种变化，说明海拔或坡向带来的差异。",
      en: "A quiet valley trail with cliff inscriptions; each bend changes the view.",
      ja: "渓谷の道と磨崖石刻。曲がるたび景色が変わる静かな山です。" },
    { id: "qf9", region: "qf", name: "九仙山", emoji: "⛰️", visit: 80, gap: 40, inside: false, hot: false,
      ticket: "约 ¥25（季节浮动）",
      intro: "小众山线，林木与古建有层次，登高可远眺曲阜平原，人少好出片。",
      solo: "登顶后别急着拍，先找一条穿过平原的河，再拍。",
      kid: "在最高点找一件比你还高的东西，说说它为什么长这么高。",
      study: "画一张从山脚到山腰的简易剖面图，标出植被与建筑。",
      en: "A lesser-known hill trail; from the top you can overlook the Qufu plain.",
      ja: "穴場の山道。山頂からは曲阜の平野を一望できます。" },
    { id: "qf10", region: "qf", name: "五马祠街 · 夜市烟火", emoji: "🍢", visit: 40, gap: 5, inside: false, hot: true,
      ticket: "免费（按小吃饭量计）",
      intro: "明故城里的小吃街，傍晚最热闹，适合把一天的行程收在烟火气里。",
      solo: "先整条街走一遍再决定吃什么，别在第一家就停。",
      kid: "数一数有多少种你叫得出名字的小吃，挑一样从没吃过的尝一口。",
      study: "记录三种本地食材的摊位分布，说明它们为什么摆在这里。",
      en: "A snack street inside the old city; busiest at dusk — a warm end to the day.",
      ja: "旧城内の食べ歩き通り。夕方が最も賑わう一日の締めくくりに。" },

    /* —— 济宁 · 运河市井 —— */
    { id: "yd1", region: "canal", name: "运河记忆馆", emoji: "🖼️", visit: 60, gap: 10, inside: true, hot: false,
      ticket: "免费（需预约）",
      intro: "从一段河道沙盘看起：水从哪里来、往哪里去，码头为什么长在这里。",
      solo: "先记住一个关键词——漕运。后面的老街、码头、老字号都会绕着它转。",
      kid: "在沙盘上找一条船，猜它装的是粮食还是盐，说说你的理由。",
      study: "记录沙盘里的闸、坝、码头位置，说明人是怎么改变水路的。",
      en: "Start from the river model: where water comes from, where it goes, and why wharves sit where they do.",
      ja: "河道の模型から。水の流れと船着き場の位置関係を観察します。" },
    { id: "yd2", region: "canal", name: "漕船工坊 · 船模展室", emoji: "⛵", visit: 40, gap: 8, inside: true, hot: false,
      ticket: "免费",
      intro: "一排船模把运河上的船型摆开，先看船头、舱口与货舱的比例。",
      solo: "船型是跟着河道走的：水浅、弯多的地方，船体就要变一个样子。",
      kid: "用手比出不同大小的箱子，猜一猜哪一个能通过舱口。",
      study: "选两条船模对比，记录载量与吃水，解释河道条件如何影响设计。",
      en: "Models of canal boats show how hull shape answers shallow, winding water.",
      ja: "船の模型を比較。浅く曲がる水路が船体を変えます。" },
    { id: "yd3", region: "canal", name: "竹竿巷老街", emoji: "🏮", visit: 45, gap: 8, inside: false, hot: true,
      ticket: "免费",
      intro: "窄巷两侧铺面相连。看门板、幌子与屋檐，市井商业的密度就写在这里。",
      solo: "数一数招牌上的老字号，留意还有哪些字号在营业。",
      kid: "找一家卖手艺的小店，看看老板手里正在做的是什么。",
      study: "记录三种行业，标注它们各自的服务对象。",
      en: "A narrow commercial lane: read shopfronts and signboards to see how trade packed into the street.",
      ja: "細い商店街。看板と店構えから商いの密度を読み取ります。" },
    { id: "yd4", region: "canal", name: "玉堂酱园 · 老字号", emoji: "🫙", visit: 30, gap: 8, inside: true, hot: false,
      ticket: "免费",
      intro: "酱缸、招牌与价目，是一条“味道如何变成生意”的线索。",
      solo: "看配料与工序说明，想一想它凭什么能卖过几百年。",
      kid: "闻一闻再猜一猜：哪一缸最咸？",
      study: "记录产品、价格带与客群，讨论老字号怎么留在今天的街市里。",
      en: "A long-established sauce house: how a local flavour became a business.",
      ja: "老舗の醤園。味が商いになる過程をたどります。" },
    { id: "yd5", region: "canal", name: "老运河夜码头", emoji: "🌙", visit: 40, gap: 10, inside: false, hot: true,
      ticket: "免费",
      intro: "天黑之后灯影落在水面，码头与城市的关系看得更清楚。",
      solo: "站在岸边看船灯移动，理解“水道即街道”。",
      kid: "数一数水面倒影里有几种颜色。",
      study: "记录码头周边的店铺类型，说明夜航对城市生活的带动。",
      en: "After dark, reflections on the water show how the wharf shaped city life.",
      ja: "日暮れの船着き場。水面の灯りから水路と街の関係を眺めます。" },

    /* —— 湖区 · 湖岸生灵 —— */
    { id: "hu1", region: "lake", name: "微山湖湿地 · 芦苇荡", emoji: "🌾", visit: 100, gap: 20, inside: false, hot: true,
      ticket: "约 ¥60 起（船票另计）",
      intro: "芦苇、荷塘与水道连成一片。先看水面，再看岸边，最后闭眼听声音。",
      solo: "停留三分钟只做一件事：听。鸟叫、船声、风过芦苇，层次会自己浮出来。",
      kid: "找一片最大的荷叶，比一比谁的手掌更像它。",
      study: "记录三种水生植物与两种鸟类，标注各自的观察位置。",
      en: "Reeds, lotus and waterways form one system. Spend three minutes only listening.",
      ja: "葦と蓮と水路。まず三分間、音だけを聴いてみましょう。" },
    { id: "hu2", region: "lake", name: "渔家船屋", emoji: "🛶", visit: 45, gap: 10, inside: true, hot: false,
      ticket: "免费（渔家餐需预约）",
      intro: "船屋把住家、灶台与鱼舱放在同一条船上，湖上的生活方式就在这条动线上。",
      solo: "看灶台与鱼舱的位置，想一想为什么它们挨得这么近。",
      kid: "猜一猜船上最小的那个空间是用来做什么的。",
      study: "画一张船屋平面图，标注生产空间与生活空间。",
      en: "A houseboat puts kitchen, living space and fish hold on one hull; read the layout.",
      ja: "船上の住まい。台所・居住・魚倉の配置を読み取ります。" },
    { id: "hu3", region: "lake", name: "微山湖博物馆 · 湖上记忆", emoji: "🏛️", visit: 60, gap: 12, inside: true, hot: false,
      ticket: "免费（需预约）",
      intro: "展线从湖的形成讲到湖上人家，把湖区的地理与生活一起铺开。",
      solo: "找一件与船有关的展品，读一读标签上的年份。",
      kid: "找一个你家也有的物件，说说它和展品有什么不一样。",
      study: "记录湖区的三种生产方式，说明它们与季节的关系。",
      en: "From the lake's formation to lake families: geography and daily life in one gallery.",
      ja: "湖の成り立ちから湖上生活までをたどる展示です。" },
    { id: "hu4", region: "lake", name: "观鸟栈道", emoji: "🦆", visit: 50, gap: 12, inside: false, hot: false,
      ticket: "免费（含于湿地票）",
      intro: "栈道伸入水面。站得远一点，鸟才会靠近。",
      solo: "用长焦或望远镜观察，记录颜色与体型，动作放轻。",
      kid: "学一种鸟叫，轻轻试一次，看同伴能不能分清。",
      study: "记录两种鸟的取食动作，说明它们为什么出现在同一片滩涂。",
      en: "A boardwalk into open water: keep your distance and note colour and size.",
      ja: "水に伸びる観察路。距離を保ち、色と大きさを記録します。" },
    { id: "hu5", region: "lake", name: "荷花荡 · 芦苇荡（季节线）", emoji: "🪷", visit: 60, gap: 12, inside: false, hot: true,
      ticket: "约 ¥40（船票另计）",
      intro: "花期里荷叶把水面分成格子；非花期，就看叶、看藕、看采莲的工具。",
      solo: "顺光与逆光各拍一张，感受光线对叶脉的影响。",
      kid: "找一片最大和一片最小的叶子，比出大小。",
      study: "记录荷花在湖区的用途，食用与观赏各写一条。",
      en: "In bloom, lotus leaves grid the water; out of season, read the tools of harvesting.",
      ja: "花期には葉が水面を区切ります。収穫の道具も観察しましょう。" }
  ];

  /* 与「地图」页景点联动：按名称匹配 */
  var ALIAS = { "孔庙": "qf2", "孔府": "qf3", "孔林": "qf5", "孔子博物馆": "qf4", "万仞宫墙·明故城": "qf1", "万仞宫墙": "qf1", "颜庙（复圣庙）": "qf6", "颜庙": "qf6",
    "尼山圣境": "qf7", "石门山": "qf8", "九仙山": "qf9", "五马祠街": "qf10", "五马祠街 · 夜市烟火": "qf10" };

  /* ---------------- 本机存储 ---------------- */
  function blank() {
    return { marks: [], favs: [], visits: {}, routes: [], notes: [], badges: {}, quizBest: 0, set: { lang: "zh", group: "solo", region: "qf", budget: 120, weather: "normal" } };
  }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw) return blank();
      var d = blank();
      d.marks = raw.marks || []; d.favs = raw.favs || []; d.visits = raw.visits || {};
      d.routes = raw.routes || []; d.notes = raw.notes || [];
      d.badges = raw.badges || {}; d.quizBest = raw.quizBest || 0;
      for (var k in d.set) if (raw.set && raw.set[k] !== undefined) d.set[k] = raw.set[k];
      return d;
    } catch (e) { return blank(); }
  }
  var db = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  function findSpot(id) { for (var i = 0; i < STOPS.length; i++) if (STOPS[i].id === id) return STOPS[i]; return null; }

  /* ---------------- 成就系统 · 圣城印记 ---------------- */
  var BADGES = {
    first:  { n: "初来乍到", e: "👣", d: "打开第一处站点讲解" },
    sankong:{ n: "三孔集章", e: "🏯", d: "听全孔庙、孔府、孔林讲解" },
    canal:  { n: "运河访客", e: "⛵", d: "听一处运河市井讲解" },
    lake:   { n: "湖岸诗人", e: "🌾", d: "听一处湖岸生灵讲解" },
    rain:   { n: "雨中行者", e: "🌧", d: "生成过雨天备选线" },
    busy:   { n: "避峰高手", e: "🧘", d: "生成过节假日避峰线" },
    kid:    { n: "亲子同行", e: "👨‍👩‍👧", d: "切换到亲子话术" },
    study:  { n: "研学导师", e: "🎓", d: "切换到研学话术" },
    lang:   { n: "语言大师", e: "🌐", d: "切换过英文或日文讲解" },
    photo:  { n: "识景先锋", e: "📷", d: "用过拍照识景" },
    plan:   { n: "运筹帷幄", e: "🧭", d: "保存过常用路线" },
    sign:   { n: "求签有缘", e: "🎋", d: "在圣城雅趣抽过论语签" },
    quiz:   { n: "闯关状元", e: "🏅", d: "雅趣问答 12 题全对通关" },
    poster: { n: "行旅画师", e: "🖼️", d: "生成过圣城打卡海报" }
  };
  var toastEl = null, toastTimer = null;
  function rfToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "rf-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }
  function award(id) {
    if (db.badges[id]) return;
    db.badges[id] = Date.now();
    save();
    var b = BADGES[id];
    if (b) rfToast("🏆 成就解锁 <b>" + b.n + "</b> " + b.e + "<br><span>" + b.d + " · 成就墙已点亮</span>");
  }

  /* ---------------- 桌面超宽屏装饰侧栏 ---------------- */
  function rails() {
    if (!window.matchMedia || !window.matchMedia("(min-width: 1440px)").matches) return;
    if (document.getElementById("rfRailL")) return;
    var l = document.createElement("div");
    l.id = "rfRailL"; l.className = "rf-rail";
    l.textContent = "运 河 儒 风 · 圣 城 行 旅";
    var r = document.createElement("div");
    r.id = "rfRailR"; r.className = "rf-rail";
    r.textContent = "曲 阜 · 有 朋 自 远 方 来";
    document.body.appendChild(l); document.body.appendChild(r);
  }

  /* ---------------- 全站金叶飘落特效 ---------------- */
  function petals() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var cv = document.createElement("canvas");
    cv.id = "rfPetals";
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d");
    var W, H, ps = [];
    function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    size(); addEventListener("resize", size);
    function newP(init) {
      return { x: Math.random() * (W || 1200), y: init ? Math.random() * (H || 800) : -20,
        s: 5 + Math.random() * 7, v: .25 + Math.random() * .55, a: Math.random() * Math.PI * 2,
        va: (Math.random() - .5) * .02, o: .22 + Math.random() * .3, sw: Math.random() * Math.PI * 2 };
    }
    for (var i = 0; i < 13; i++) ps.push(newP(true));
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.y += p.v; p.a += p.va; p.sw += .012;
        p.x += Math.sin(p.sw) * .4;
        if (p.y > H + 24 || p.x > W + 40 || p.x < -40) ps[i] = newP(false);
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.globalAlpha = p.o;
        var g = ctx.createLinearGradient(-p.s, -p.s, p.s, p.s);
        g.addColorStop(0, "#f5c042"); g.addColorStop(1, "#d0782e");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function hhmm(min) { return (min < 0 ? "0" : Math.round(min)) + " 分"; }

  /* ---------------- 行程编排 ---------------- */
  function makePlan(p) {
    var budget = +p.budget || 120;
    var pool = STOPS.filter(function (s) { return s.region === p.region; });
    var note = "";
    if (p.weather === "rain") {
      var dry = pool.filter(function (s) { return s.inside; });
      if (dry.length) { pool = dry; note = "雨天方案仅取室内站点，转场尽量走有遮蔽的街巷。"; }
      else note = "该片区室内站点有限，已保留可用站点并提示随身雨具。";
    } else if (p.weather === "busy") {
      var cool = pool.filter(function (s) { return !s.hot; });
      if (cool.length >= 2) { pool = cool; note = "节假日方案避开预设热点，优先选择人流相对分散的站点。"; }
      else note = "该片区可选站点较少，建议开园即到并预留排队时间。";
    }
    if (p.weather === "rain") award("rain");
    else if (p.weather === "busy") award("busy");
    if (!note) note = "按停留、转场与休息时间排程，可按现场情况随时改线。";

    var rest = p.group === "kid" ? 12 : p.group === "study" ? 10 : 0;
    var stops = [], t = 10, i;
    for (i = 0; i < pool.length; i++) {
      var s = pool[i];
      var need = s.gap + s.visit;
      if (stops.length === 0) {
        if (t + need > budget) {
          var best = pool.slice().sort(function (a, b) { return (a.gap + a.visit) - (b.gap + b.visit); })[0];
          if (best.gap + best.visit + t > budget) { stops.push({ id: best.id, start: t + best.gap, visit: best.visit, gap: best.gap, rest: 0 }); t += best.gap + best.visit; }
          else { stops.push({ id: best.id, start: t + best.gap, visit: best.visit, gap: best.gap, rest: 0 }); t += best.gap + best.visit; }
          if (best !== s) { pool = pool.filter(function (x) { return x.id !== best.id; }); i = -1; }
          continue;
        }
        t += s.gap; stops.push({ id: s.id, start: t, visit: s.visit, gap: s.gap, rest: 0 }); t += s.visit;
        continue;
      }
      var addRest = stops.length % 2 === 0 ? rest : 0;
      if (t + addRest + need > budget) break;
      t += addRest + s.gap;
      stops.push({ id: s.id, start: t, visit: s.visit, gap: s.gap, rest: addRest });
      t += s.visit;
    }
    return { p: { region: p.region, budget: budget, group: p.group, weather: p.weather }, stops: stops, elapsed: t, spare: budget - t, notes: note };
  }

  /* ---------------- UI：弹层 ---------------- */
  function sheetEl() {
    var el = document.getElementById("rfSheet");
    if (el) return el;
    var mask = document.createElement("div");
    mask.className = "rf-mask";
    mask.id = "rfMask";
    var box = document.createElement("div");
    box.className = "rf-sheet";
    box.id = "rfSheet";
    document.body.appendChild(mask);
    document.body.appendChild(box);
    function close() { mask.classList.remove("show"); box.classList.remove("show"); }
    mask.onclick = close;
    box.addEventListener("click", function (e) { if (e.target.id === "rfClose") close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    box._close = close;
    return box;
  }
  function openSheet(html, wide) {
    var box = sheetEl(), mask = document.getElementById("rfMask");
    box.innerHTML = '<button class="rf-x" id="rfClose">✕</button>' + html;
    box.classList.add("show"); mask.classList.add("show");
    box.scrollTop = 0;
  }

  /* ---------------- 讲解 ---------------- */
  function lesson(s, group, lang) {
    if (lang === "en") return s.en;
    if (lang === "ja") return s.ja;
    if (group === "kid") return s.kid;
    if (group === "study") return s.study;
    return s.solo;
  }
  function talk(idOrName, opt) {
    opt = opt || {};
    var id = idOrName;
    if (!findSpot(id)) id = ALIAS[idOrName] || null;
    if (!id) {
      for (var i = 0; i < STOPS.length; i++) if (STOPS[i].name.indexOf(String(idOrName)) >= 0) { id = STOPS[i].id; break; }
    }
    var s = findSpot(id);
    if (!s) { openSheet('<h2>暂未收录该站点</h2><p class="rf-muted">可以试试：孔庙、孔府、运河记忆馆、渔家船屋。</p>'); return; }
    renderTalk(s, opt.group || db.set.group, opt.lang || db.set.lang);
  }
  function renderTalk(s, group, lang) {
    markVisit(s.id);
    var others = ["solo", "kid", "study"].map(function (g) {
      return '<button data-grp="' + g + '" class="' + (g === group ? "on" : "") + '">' + GROUPS[g].name + "</button>";
    }).join("");
    var langs = Object.keys(LANGS).map(function (l) {
      return '<button data-lang="' + l + '" class="' + (l === lang ? "on" : "") + '">' + LANGS[l] + "</button>";
    }).join("");
    var body = lesson(s, group, lang);
    openSheet(
      '<h2>' + s.emoji + " " + esc(s.name) + '<span class="rf-seal">' + REGIONS[s.region].name.split(" · ")[0] + "</span></h2>" +
      '<p class="rf-muted" style="margin-top:6px">' + (WEATHERS.normal && "") + (s.inside ? "室内站点" : "露天站点") + " · 建议停留 " + s.visit + " 分钟 · " + esc(s.ticket) + "</p>" +
      '<div class="rf-seg" id="rfGrp">' + others + "</div>" +
      '<div class="rf-seg" id="rfLang">' + langs + "</div>" +
      '<div class="rf-say"><b>到站先看：</b>' + esc(s.intro) + "</div>" +
      '<div class="rf-say" style="margin-top:8px"><b>' + esc(GROUPS[group].name) + " · 讲解要点：</b><span id=\"rfLesson\">" + esc(body) + "</span></div>" +
      '<div class="rf-ask-row"><input id="rfAsk" placeholder="随走随问：这座要逛多久？孩子听不懂怎么办？"><button class="rf-btn mini" id="rfAskGo">提问</button></div>' +
      '<div class="rf-ans" id="rfAns"></div>' +
      '<div class="rf-actions">' +
      '<button class="rf-btn ghost mini" id="rfStamp">' + (db.marks.indexOf(s.id) >= 0 ? "已盖行旅章 ✓" : "盖一枚行旅章") + "</button>" +
      '<button class="rf-btn ghost mini" id="rfFav2">' + (db.favs.indexOf("stop:" + s.id) >= 0 ? "已在收藏 ✓" : "加入我的收藏") + "</button>" +
      '<button class="rf-btn gold mini" id="rfSpeak">🔊 朗读讲解</button></div>' +
      '<div class="rf-note">讲解为示范内容，用于演示讲解方式；现场开放时间、票价与客流请以景区公告为准。</div>'
    );
    var box = document.getElementById("rfSheet");
    box.querySelector("#rfGrp").onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      db.set.group = b.dataset.grp; save();
      if (b.dataset.grp === "kid") award("kid");
      if (b.dataset.grp === "study") award("study");
      renderTalk(s, b.dataset.grp, lang);
    };
    box.querySelector("#rfLang").onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      db.set.lang = b.dataset.lang; save();
      if (b.dataset.lang !== "zh") award("lang");
      renderTalk(s, group, b.dataset.lang);
    };
    box.querySelector("#rfStamp").onclick = function () {
      if (db.marks.indexOf(s.id) < 0) db.marks.push(s.id);
      var ok = save(); syncCount();
      this.textContent = ok ? "已盖行旅章 ✓" : "已盖（本次有效）";
      this.classList.add("on");
    };
    box.querySelector("#rfFav2").onclick = function () {
      toggleFav("stop:" + s.id, s.name, s.emoji);
      this.textContent = db.favs.indexOf("stop:" + s.id) >= 0 ? "已在收藏 ✓" : "加入我的收藏";
      this.classList.toggle("on", db.favs.indexOf("stop:" + s.id) >= 0);
    };
    box.querySelector("#rfSpeak").onclick = function () {
      if (!("speechSynthesis" in window)) { box.querySelector("#rfAns").innerHTML = "当前浏览器不支持朗读，可改用手机系统自带的“朗读屏幕”功能。"; return; }
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(s.name + "。" + s.intro + "。" + body);
        u.lang = lang === "en" ? "en-US" : lang === "ja" ? "ja-JP" : "zh-CN";
        u.rate = .95; window.speechSynthesis.speak(u);
        this.textContent = "🔊 正在朗读…";
        var self = this; setTimeout(function () { self.textContent = "🔊 朗读讲解"; }, 1200);
      } catch (e) { box.querySelector("#rfAns").innerHTML = "朗读启动失败，请检查系统语音设置。"; }
    };
    var ask = function () {
      var q = box.querySelector("#rfAsk").value.trim();
      if (!q) return;
      box.querySelector("#rfAns").innerHTML = '<span class="rf-dots"><i></i><i></i><i></i></span> 正在检索讲解语料…';
      setTimeout(function () { box.querySelector("#rfAns").innerHTML = answer(q, s); }, 420);
    };
    box.querySelector("#rfAskGo").onclick = ask;
    box.querySelector("#rfAsk").onkeydown = function (e) { if (e.key === "Enter") ask(); };
  }
  function markVisit(id) {
    db.visits[id] = Date.now();
    if (db.marks.indexOf(id) < 0) db.marks.push(id);
    save(); syncCount();
    award("first");
    var vs = findSpot(id);
    if (vs && vs.region === "canal") award("canal");
    if (vs && vs.region === "lake") award("lake");
    if (db.marks.indexOf("qf2") >= 0 && db.marks.indexOf("qf3") >= 0 && db.marks.indexOf("qf5") >= 0) award("sankong");
  }

  /* ---------------- 随走随问（本地语料检索） ---------------- */
  function answer(q, cur) {
    var text = String(q);
    var hitStop = null, i;
    for (i = 0; i < STOPS.length; i++) {
      var n = STOPS[i].name;
      if (text.indexOf(n) >= 0 || n.indexOf(text.replace(/[？?。，,\s]/g, "")) >= 0) { hitStop = STOPS[i]; break; }
    }
    var target = hitStop || cur;
    if (/多久|多长时间|逛多久|时间/.test(text) && target) {
      return "<b>" + esc(target.name) + "</b>建议停留约 " + target.visit + " 分钟；含转场请再留 " + target.gap + " 分钟。" + (target.inside ? "这里以室内为主，雨天可优先安排。" : "这里以露天为主，遇雨建议改为室内站点。");
    }
    if (/门票|票价|多少钱|收费/.test(text) && target) {
      return "<b>" + esc(target.name) + "</b>参考票价：" + esc(target.ticket) + "。联票与预约政策以景区公告为准。";
    }
    if (/孩子|小孩|亲子|听不懂/.test(text)) {
      return "给孩子讲的时候，先让他找一个具体的物件——一片叶子、一道门、一条船，再用一句话说清用途。" +
        (target ? "例如在<b>" + esc(target.name) + "</b>：" + esc(target.kid) : "");
    }
    if (/研学|作业|记录|任务/.test(text)) {
      return "研学任务讲究可验收。" + (target ? "<b>" + esc(target.name) + "</b>的记录任务是：" + esc(target.study) : "每站给一个可收的记录项，比听讲解更有效。");
    }
    if (/英语|英文|english|外语|日语|多语/.test(text)) {
      return "讲解支持中文、英文与日文切换。示例（" + (target ? esc(target.name) : "孔庙") + "）：" + esc(target ? target.en : STOPS[1].en);
    }
    if (/下雨|雨天|雨|室内/.test(text)) {
      var indoor = STOPS.filter(function (s) { return s.region === (cur ? cur.region : "qf") && s.inside; }).map(function (s) { return s.name; });
      return "雨天改走室内：本片区可选 " + esc(indoor.join("、")) + "。行程定制台点一下“换雨天备选线”也会自动重排。";
    }
    if (/节假日|人多|排队|高峰/.test(text)) {
      var cool = STOPS.filter(function (s) { return s.region === (cur ? cur.region : "qf") && !s.hot; }).map(function (s) { return s.name; });
      return "节假日建议避开预设热点，改选：" + esc(cool.join("、")) + "；并把开园时段留给最想看的一处。";
    }
    if (/怎么走|路线|安排|规划|行程/.test(text)) {
      return "到「攻略」页的智能行程定制台，按兴趣、时间、同行人和天气生成路书；生成后可一键保存到「我的 · 常用路线」，也能导出带队讲解稿。";
    }
    if (/洗手间|厕所|卫生间/.test(text)) {
      return "景区入口、游客服务中心与博物馆楼层内一般设有公共卫生间，带孩子建议每两站安排一次固定停留，行程里已自动留出休息时间。";
    }
    if (/美食|吃什么|小吃|餐厅|孔府宴|夜市|饿/.test(text)) {
      return "圣城食光：孔府宴（诗礼银杏、一品豆腐）适合正式一餐；粥泡羊肉 + 吊炉烧饼是本地早餐图腾；傍晚去五马祠街夜市收尾。分人群点单建议见「美食」页。";
    }
    if (/住宿|酒店|宾馆|客栈|住哪/.test(text)) {
      return "住宿建议：明故城周边步行可达三孔，适合一至两晚的紧凑行程；想兼顾夜景与演出可考虑蓼河一线。节假日（尤其 9 月底祭孔周）务必提前预订。";
    }
    if (/高铁|火车|曲阜东|怎么到|怎么去曲阜|车站/.test(text)) {
      return "到曲阜：京沪高铁「曲阜东站」距市区约 8 公里，公交 K01 或打车约 20 分钟；自驾走 G3 京台高速「曲阜」出口。三孔景区集中，市内步行即可串联。";
    }
    if (/演出|表演|灯光秀|夜游|无人机|蓼河|夜景/.test(text)) {
      return "夜间节目：明故城城墙灯光、蓼河夜画演出、尼山圣境夜间礼乐与无人机表演（场次随季节调整，建议提前在官方公众号确认购票）。";
    }
    if (/拍照|机位|出片|合影|照片/.test(text)) {
      return "出片机位：万仞宫墙下仰拍城楼、大成殿雕龙石柱特写、孔林神道纵深、运河夜码头倒影、湖上栈道逆光剪影。阴天反而适合拍建筑细节。";
    }
    if (/行李|装备|带什么|穿什么|准备|清单/.test(text)) {
      return "出发前可到「圣城雅趣 · 行装清单」，按季节、同行人与天气勾选随身物品，勾选进度会自动保存在本机。";
    }
    if (/预算|花销|花费|费用|一天多少钱/.test(text)) {
      return "花费估算：经济玩法人均约 ¥200~300/天（三孔联票 ¥140 + 小吃），舒适玩法约 ¥400~600/天。可用「圣城雅趣 · 旅费速算」按人数天数直接算。";
    }
    if (/抽签|灵签|闯关|问答|游戏|雅趣|海报|印章/.test(text)) {
      return "「圣城雅趣」页可抽论语灵签、玩儒学闯关、生成打卡海报、勾行装清单、算旅费、看节庆日历——底部导航之外，从首页功能卡即可进入。";
    }
    if (target) {
      return "关于<b>" + esc(target.name) + "</b>：" + esc(target.intro) + "　" + esc(lesson(target, db.set.group, db.set.lang));
    }
    return "可以先在「攻略」页生成一份路书，再带着问题走。也可以直接问：这座要逛多久、孩子怎么讲、下雨怎么改、票价多少。";
  }

  /* ---------------- 拍照识景（示范样本） ---------------- */
  function photo() {
    award("photo");
    var samples = ["qf2", "qf3", "yd1", "yd2", "hu1", "hu3"].map(function (id) {
      var s = findSpot(id);
      return '<button class="rf-shot" data-shot="' + id + '"><span>' + s.emoji + "</span>" + esc(s.name) + "</button>";
    }).join("");
    openSheet(
      "<h2>拍照识景 · 即时讲解</h2>" +
      '<p class="rf-muted" style="margin-top:6px">选一张示范样本，或拍一张现场照片。识别结果由内置站点库匹配，用于演示“拍完即讲”的交互。</p>' +
      '<div class="rf-shots" id="rfShots">' + samples + "</div>" +
      '<div class="rf-ask-row"><input type="file" accept="image/*" id="rfFile" style="padding:9px;font-size:12px"><button class="rf-btn mini" id="rfShoot">模拟拍摄识别</button></div>' +
      '<div id="rfPreview" style="margin-top:10px"></div>' +
      '<div class="rf-ans" id="rfShotAns"></div>' +
      '<div class="rf-note">本机未接入云端视觉模型；接入方式：把识别接口换成自有服务，返回站点名称即可复用同一套讲解。</div>'
    );
    var box = document.getElementById("rfSheet");
    box.querySelector("#rfShots").onclick = function (e) {
      var b = e.target.closest("[data-shot]"); if (!b) return;
      box.querySelectorAll(".rf-shot").forEach(function (x) { x.classList.remove("picked"); });
      b.classList.add("picked");
      var s = findSpot(b.dataset.shot);
      box.querySelector("#rfShotAns").innerHTML = '<span class="rf-dots"><i></i><i></i><i></i></span> 正在识别画面特征…';
      setTimeout(function () {
        box.querySelector("#rfShotAns").innerHTML =
          "识别结果（示范）：<b>" + esc(s.name) + "</b> · 匹配度 92%<br>" + esc(s.intro) +
          '<div class="rf-actions"><button class="rf-btn mini" id="rfGo">进入讲解 →</button></div>';
        box.querySelector("#rfGo").onclick = function () { renderTalk(s, db.set.group, db.set.lang); };
      }, 700);
    };
    box.querySelector("#rfShoot").onclick = function () {
      var f = box.querySelector("#rfFile").files[0];
      if (!f) { box.querySelector("#rfShotAns").innerHTML = "请先选择一张示范样本，或拍一张照片。"; return; }
      var r = new FileReader();
      r.onload = function () {
        box.querySelector("#rfPreview").innerHTML = '<img src="' + r.result + '" alt="现场照片预览" style="width:100%;border-radius:12px">';
        var pool = STOPS.filter(function (s) { return ["qf2", "qf3", "yd1", "yd2", "hu1", "hu3"].indexOf(s.id) >= 0; });
        var guess = pool[f.size % pool.length];
        box.querySelector("#rfShotAns").innerHTML = '<span class="rf-dots"><i></i><i></i><i></i></span> 正在识别画面特征…';
        setTimeout(function () {
          box.querySelector("#rfShotAns").innerHTML = "识别结果（示范）：<b>" + esc(guess.name) + "</b> · 匹配度 " + (78 + f.size % 15) + "%" +
            '<div class="rf-actions"><button class="rf-btn mini" id="rfGo2">进入讲解 →</button></div>';
          box.querySelector("#rfGo2").onclick = function () { renderTalk(guess, db.set.group, db.set.lang); };
        }, 900);
      };
      r.readAsDataURL(f);
    };
  }

  /* ---------------- 收藏 / 足迹 / 路线 ---------------- */
  function toggleFav(key, name, emoji) {
    var i = db.favs.indexOf(key);
    if (i >= 0) db.favs.splice(i, 1);
    else db.favs.push(key);
    save(); syncCount();
    return i < 0;
  }
  function syncCount() {
    var c = document.getElementById("count");
    if (c) c.textContent = db.marks.length + db.favs.length;
  }
  function saveRoute(plan) {
    db.routes.unshift({ at: Date.now(), p: plan.p, stops: plan.stops.map(function (t) { return t.id; }), elapsed: plan.elapsed });
    db.routes = db.routes.slice(0, 5);
    award("plan");
    return save();
  }

  /* ---------------- 渲染：行程定制台（攻略页） ---------------- */
  function mountPlanner(box) {
    var s = db.set;
    function opt(list, cur, valKey, nameKey) {
      return list.map(function (o) {
        var v = valKey ? o[valKey] : o.v, n = nameKey ? o[nameKey] : o.n;
        return '<option value="' + v + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + n + "</option>";
      }).join("");
    }
    var regionOpts = Object.keys(REGIONS).map(function (k) {
      return '<option value="' + k + '"' + (k === s.region ? " selected" : "") + ">" + REGIONS[k].emoji + " " + REGIONS[k].name + "</option>";
    }).join("");
    var groupOpts = Object.keys(GROUPS).map(function (k) {
      return '<option value="' + k + '"' + (k === s.group ? " selected" : "") + ">" + GROUPS[k].name + "</option>";
    }).join("");
    var weatherOpts = Object.keys(WEATHERS).map(function (k) {
      return '<option value="' + k + '"' + (k === s.weather ? " selected" : "") + ">" + WEATHERS[k].name + "</option>";
    }).join("");

    box.innerHTML =
      '<h3>一人一策 · 说出你的条件</h3>' +
      '<p class="rf-muted">选择兴趣、可用时间、同行人与出行情境，生成含转场与休息时间的路书，并附现场讲解要点。</p>' +
      '<form class="rf-form" id="rfForm">' +
      '<label class="rf-field"><span>01 兴趣主题</span><select name="region">' + regionOpts + "</select></label>" +
      '<label class="rf-field"><span>02 可用时间</span><select name="budget">' + opt(BUDGETS, s.budget, "v", "n") + "</select></label>" +
      '<label class="rf-field"><span>03 同行旅伴</span><select name="group">' + groupOpts + "</select></label>" +
      '<label class="rf-field"><span>04 出行情境</span><select name="weather">' + weatherOpts + "</select></label>" +
      '<label class="rf-field" style="grid-column:1/-1"><span>05 讲解语言</span><select name="lang">' +
      Object.keys(LANGS).map(function (l) { return '<option value="' + l + '"' + (l === s.lang ? " selected" : "") + ">" + LANGS[l] + "</option>"; }).join("") +
      "</select></label>" +
      '<button class="rf-btn rf-go" type="submit">生成我的专属路书 →</button>' +
      "</form>" +
      '<div class="rf-quicks" id="rfQuicks">' +
      '<span class="rf-chip" data-q="雨天">🌧 现在下雨了</span>' +
      '<span class="rf-chip" data-q="亲子">👨‍👩‍👧 带娃两小时</span>' +
      '<span class="rf-chip" data-q="研学">🎓 研学小队半日</span>' +
      '<span class="rf-chip" data-q="运河">⛵ 想看运河</span>' +
      "</div>" +
      '<div id="rfOut"></div>';

    var form = box.querySelector("#rfForm");
    box.querySelector("#rfQuicks").onclick = function (e) {
      var c = e.target.closest("[data-q]"); if (!c) return;
      var q = c.dataset.q;
      if (q === "雨天") { form.elements.weather.value = "rain"; form.elements.budget.value = 60; }
      if (q === "亲子") { form.elements.group.value = "kid"; form.elements.budget.value = 120; }
      if (q === "研学") { form.elements.group.value = "study"; form.elements.budget.value = 240; }
      if (q === "运河") { form.elements.region.value = "canal"; }
      form.requestSubmit();
    };
    form.onsubmit = function (e) {
      e.preventDefault();
      var p = {};
      ["region", "budget", "group", "weather", "lang"].forEach(function (k) { p[k] = form.elements[k].value; });
      db.set.region = p.region; db.set.budget = +p.budget; db.set.group = p.group; db.set.weather = p.weather; db.set.lang = p.lang;
      var plan = makePlan(p);
      save();
      renderPlan(box.querySelector("#rfOut"), plan, p.lang);
    };
    /* 载入上次条件 */
    var last = db.routes[0];
    if (last && last.p && last.p.region) {
      form.elements.region.value = last.p.region;
      form.elements.budget.value = last.p.budget;
      form.elements.group.value = last.p.group;
      form.elements.weather.value = last.p.weather;
    }
    form.requestSubmit();
  }

  function renderPlan(out, plan, lang) {
    var region = REGIONS[plan.p.region];
    var total = plan.stops.reduce(function (n, t) { return n + t.visit; }, 0);
    var walk = plan.stops.reduce(function (n, t) { return n + t.gap; }, 10);
    var rows = plan.stops.map(function (t, i) {
      var s = findSpot(t.id);
      return '<li class="rf-stop" data-i="' + (i + 1) + '" style="animation-delay:' + (i * 70) + 'ms">' +
        "<h4>" + s.emoji + " " + esc(s.name) + "<em>出发后 " + t.start + "–" + (t.start + t.visit) + " 分</em></h4>" +
        '<div class="rf-tags"><span class="rf-tag">停留 ' + t.visit + " 分</span>" +
        (t.gap ? '<span class="rf-tag gold">前序转场 ' + t.gap + " 分</span>" : "") +
        (t.rest ? '<span class="rf-tag gold">休息 ' + t.rest + " 分</span>" : "") +
        '<span class="rf-tag">' + (s.inside ? "室内" : "露天") + "</span>" +
        '<span class="rf-tag gold">' + esc(s.ticket) + "</span></div>" +
        "<p>" + esc(s.intro) + "</p>" +
        '<div class="rf-say"><b>讲解要点：</b>' + esc(lesson(s, plan.p.group, lang)) + "</div>" +
        '<div class="rf-actions"><button class="rf-btn ghost mini" data-talk="' + s.id + '">🎧 打开讲解</button>' +
        '<button class="rf-btn ghost mini" data-fav="' + s.id + '" data-name="' + esc(s.name) + '" data-emoji="' + s.emoji + '">' +
        (db.favs.indexOf("stop:" + s.id) >= 0 ? "已在收藏 ✓" : "收藏此站") + "</button></div></li>";
    }).join("");

    out.innerHTML =
      '<div class="rf-head" style="margin:18px 0 10px"><span class="orn">❖</span><h2>我的路书</h2><span class="aside">' + region.emoji + " " + (plan.p.weather === "rain" ? "雨天备选线" : plan.p.weather === "busy" ? "节日避峰线" : "常规线") + "</span></div>" +
      '<div class="rf-panel rf-in">' +
      '<div class="rf-sum">' +
      "<span><b>" + plan.stops.length + "</b><i>站点</i></span>" +
      "<span><b>" + plan.elapsed + "</b><i>预计总时长 / 分</i></span>" +
      "<span><b>" + total + "</b><i>纯游览 / 分</i></span>" +
      "<span><b>" + Math.max(0, plan.spare) + "</b><i>机动余量 / 分</i></span>" +
      "</div>" +
      '<p class="rf-muted">' + region.name + " · " + GROUPS[plan.p.group].name + " · " + LANGS[lang] + "讲解</p>" +
      '<p class="rf-muted" style="margin-top:4px">' + esc(GROUPS[plan.p.group].tip) + "</p>" +
      '<p class="rf-muted" style="margin-top:4px">' + esc(plan.notes) + "</p>" +
      '<ul class="rf-tl">' + rows + "</ul>" +
      '<div class="rf-actions">' +
      '<button class="rf-btn gold mini" id="rfExport">导出带队讲解稿 ↓</button>' +
      '<button class="rf-btn ghost mini" id="rfSwitch">' + (plan.p.weather === "rain" ? "恢复常规路线 ↻" : "换雨天备选线 ↻") + "</button>" +
      '<button class="rf-btn ghost mini" id="rfSaveRoute">保存到常用路线</button>' +
      '<button class="rf-btn ghost mini" id="rfTour">▶ 一键连播导览</button></div>' +
      '<div class="rf-note">站点与用时为示范素材，出发前请核对当日开放、预约与交通；步行与转场时间按片区估算。</div>' +
      "</div>";

    out.querySelector("#rfTalkBox") ;
    out.onclick = function (e) {
      var t = e.target.closest("[data-talk]");
      var f = e.target.closest("[data-fav]");
      if (t) talk(t.dataset.talk, { group: plan.p.group, lang: lang });
      if (f) {
        var on = toggleFav("stop:" + f.dataset.fav, f.dataset.name, f.dataset.emoji);
        f.textContent = on ? "已在收藏 ✓" : "收藏此站";
      }
    };
    out.querySelector("#rfSwitch").onclick = function () {
      var form = document.getElementById("rfForm");
      form.elements.weather.value = plan.p.weather === "rain" ? "normal" : "rain";
      form.requestSubmit();
    };
    out.querySelector("#rfSaveRoute").onclick = function () {
      var ok = saveRoute(plan);
      this.textContent = ok ? "已保存 ✓ 可在「我的」查看" : "保存失败（浏览器未允许本地存储）";
    };
    /* 一键连播导览：按路书顺序自动朗读每一站 */
    var tourBtn = out.querySelector("#rfTour");
    if (tourBtn) {
      var touring = false;
      tourBtn.onclick = function () {
        var self = this;
        if (!("speechSynthesis" in window)) { self.textContent = "当前浏览器不支持朗读"; return; }
        if (touring) { touring = false; window.speechSynthesis.cancel(); self.textContent = "▶ 一键连播导览"; return; }
        touring = true;
        var list = plan.stops.map(function (t) {
          var s = findSpot(t.id);
          return { n: s.name, txt: s.name + "。" + s.intro + "。" + lesson(s, plan.p.group, lang) };
        });
        var i = 0;
        (function next() {
          if (i >= list.length || !touring) { touring = false; self.textContent = "▶ 一键连播导览"; return; }
          var u = new SpeechSynthesisUtterance(list[i].txt);
          u.lang = lang === "en" ? "en-US" : lang === "ja" ? "ja-JP" : "zh-CN";
          u.rate = .95;
          self.textContent = "⏸ 连播中：第 " + (i + 1) + " 站 · " + list[i].n + "（点按停止）";
          u.onend = u.onerror = function () { i++; setTimeout(next, 350); };
          window.speechSynthesis.speak(u);
        })();
      };
    }
    out.querySelector("#rfExport").onclick = function () {
      var lines = ["运河儒风 | 带队讲解单",
        region.name + " · " + GROUPS[plan.p.group].name + " · " + WEATHERS[plan.p.weather].name,
        "共 " + plan.stops.length + " 站，预计 " + plan.elapsed + " 分钟，机动 " + Math.max(0, plan.spare) + " 分钟。",
        plan.notes];
      plan.stops.forEach(function (t, i) {
        var s = findSpot(t.id);
        lines.push("\n第 " + (i + 1) + " 站｜" + s.name + "（出发后 " + t.start + " 至 " + (t.start + t.visit) + " 分钟，前序转场 " + t.gap + " 分钟，停留 " + t.visit + " 分钟）",
          "到站先看：" + s.intro,
          "现场讲解：" + s.solo,
          "亲子话术：" + s.kid,
          "研学任务：" + s.study,
          "English: " + s.en,
          "日本語: " + s.ja,
          "参考票价：" + s.ticket);
      });
      lines.push("\n示范素材与估时，出发前请核对实际场馆与交通。");
      var url = URL.createObjectURL(new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/plain;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url; a.download = "运河儒风-带队讲解单.txt";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      this.textContent = "已导出 ✓";
    };
  }

  /* ---------------- 渲染：地图页联动 ---------------- */
  function mountMap() {
    var fab = document.getElementById("rfFab");
    if (fab) fab.onclick = function () {
      openSheet(
        "<h2>🎧 智能讲解 · 随走随问</h2>" +
        '<p class="rf-muted" style="margin-top:6px">点到哪讲到哪：也可以直接问时间、票价、带娃怎么讲、下雨怎么改。</p>' +
        '<div class="rf-actions">' +
        '<button class="rf-btn mini" id="rfOpenPhoto">📷 拍照识景</button>' +
        '<button class="rf-btn ghost mini" id="rfToPlan">🧭 去定制行程</button>' +
        '<button class="rf-btn ghost mini" id="rfToFun">🎮 圣城雅趣</button></div>' +
        '<div class="rf-ask-row"><input id="rfAsk" placeholder="例如：孔庙要逛多久？下雨怎么改？"><button class="rf-btn mini" id="rfAskGo">提问</button></div>' +
        '<div class="rf-shots" id="rfQuickStops">' +
        ["qf1", "qf2", "qf4", "yd1", "hu1", "hu2"].map(function (id) {
          var s = findSpot(id);
          return '<button class="rf-shot" data-talk="' + id + '"><span>' + s.emoji + "</span>" + esc(s.name) + "</button>";
        }).join("") +
        "</div>" +
        '<div class="rf-ans" id="rfAns"></div>' +
        '<div class="rf-note">讲解为示范语料，随走随问在本机检索，不联网也能用。</div>'
      );
      var box = document.getElementById("rfSheet");
      box.querySelector("#rfOpenPhoto").onclick = photo;
      box.querySelector("#rfToPlan").onclick = function () { location.href = "./guide.html#rfPlanner"; };
      box.querySelector("#rfToFun").onclick = function () { location.href = "./fun.html"; };
      box.querySelector("#rfQuickStops").onclick = function (e) {
        var b = e.target.closest("[data-talk]"); if (b) talk(b.dataset.talk, {});
      };
      var run = function () {
        var q = box.querySelector("#rfAsk").value.trim(); if (!q) return;
        box.querySelector("#rfAns").innerHTML = '<span class="rf-dots"><i></i><i></i><i></i></span> 正在检索讲解语料…';
        setTimeout(function () { box.querySelector("#rfAns").innerHTML = answer(q, null); }, 420);
      };
      box.querySelector("#rfAskGo").onclick = run;
      box.querySelector("#rfAsk").onkeydown = function (e) { if (e.key === "Enter") run(); };
    };
    if (location.hash === "#talk" && fab) fab.click();
  }

  /* ---------------- 渲染：我的（个人页） ---------------- */
  function mountMe() {
    var box = document.getElementById("rfMe");
    var sv = document.getElementById("stVisit"), sf = document.getElementById("stFav");
    if (sv) sv.innerHTML = Object.keys(db.visits).length + '<span style="font-size:11px">/' + STOPS.length + "</span>";
    if (sf) sf.textContent = db.favs.length;
    if (!box) return;
    function level() {
      var n = Object.keys(db.visits).length;
      if (n >= STOPS.length) return { lv: 5, name: "圣城通", need: 0 };
      if (n >= 9) return { lv: 4, name: "圣城常客", need: STOPS.length - n };
      if (n >= 6) return { lv: 3, name: "三孔门生", need: 9 - n };
      if (n >= 3) return { lv: 2, name: "寻迹之旅", need: 6 - n };
      return { lv: 1, name: "初至圣城", need: 3 - n };
    }
    function favList() {
      if (!db.favs.length) return '<p class="rf-muted">还没有收藏。在景点详情、路书站点或美食卡片上点“收藏”，就会出现在这里。</p>';
      return db.favs.map(function (k) {
        var id = k.split(":")[1];
        if (k.indexOf("stop:") === 0) {
          var s = findSpot(id);
          return s ? '<button class="rf-btn ghost mini" data-me-talk="' + s.id + '">' + s.emoji + " " + esc(s.name) + "</button>" : "";
        }
        return '<span class="rf-tag gold">' + esc(id) + "</span>";
      }).join(" ");
    }
    function visitList() {
      var ids = Object.keys(db.visits).sort(function (a, b) { return db.visits[b] - db.visits[a]; });
      if (!ids.length) return '<p class="rf-muted">还没有足迹。打开任一站点讲解，系统会自动记下到访时间。</p>';
      return '<ul class="rf-tl">' + ids.map(function (id, i) {
        var s = findSpot(id); if (!s) return "";
        var d = new Date(db.visits[id]);
        return '<li class="rf-stop" data-i="' + (i + 1) + '"><h4>' + s.emoji + " " + esc(s.name) +
          "<em>" + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + "</em></h4>" +
          '<p>' + esc(s.intro) + '</p><div class="rf-actions"><button class="rf-btn ghost mini" data-me-talk="' + s.id + '">🎧 再看讲解</button></div></li>';
      }).join("") + "</ul>";
    }
    function routeList() {
      if (!db.routes.length) return '<p class="rf-muted">还没有保存的路书。到「攻略 · 智能行程定制台」生成后点“保存到常用路线”。</p>';
      return db.routes.map(function (r, i) {
        var d = new Date(r.at);
        return '<div class="rf-panel rf-in" style="margin:0 0 10px;animation-delay:' + (i * 60) + 'ms">' +
          "<h3>" + REGIONS[r.p.region].emoji + " " + esc(REGIONS[r.p.region].name) + "</h3>" +
          '<p class="rf-muted">' + GROUPS[r.p.group].name + " · " + WEATHERS[r.p.weather].name + " · " + r.stops.length + " 站 · 预计 " + r.elapsed + " 分钟<br>" +
          "保存于 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日</p>" +
          '<div class="rf-tags">' + r.stops.map(function (id) {
            var s = findSpot(id); return s ? '<span class="rf-tag">' + s.emoji + " " + esc(s.name) + "</span>" : "";
          }).join("") + "</div>" +
          '<div class="rf-actions"><a class="rf-btn ghost mini" href="./guide.html#rfPlanner">在攻略页重排 →</a></div></div>';
      }).join("");
    }
    function badgeWall() {
      var keys = Object.keys(BADGES), got = 0;
      keys.forEach(function (k) { if (db.badges[k]) got++; });
      return '<p class="rf-muted">已点亮 ' + got + " / " + keys.length + " 枚圣城印记 · 按提示使用对应功能即可解锁</p>" +
        '<div class="rf-badges">' + keys.map(function (k) {
          var on = !!db.badges[k], b = BADGES[k];
          return '<div class="rf-badge' + (on ? " on" : "") + '"><span>' + b.e + "</span><b>" + b.n + "</b><i>" + (on ? esc(b.d) : "？？？") + "</i></div>";
        }).join("") + "</div>";
    }
    var L = level();
    var pct = Math.min(100, Math.round(Object.keys(db.visits).length / STOPS.length * 100));
    box.innerHTML =
      '<div class="rf-panel rf-in">' +
      "<h3>行旅护照</h3>" +
      '<p class="rf-muted">足迹与收藏只保存在本机浏览器，无需登录，也不上传任何个人信息。</p>' +
      '<div class="rf-sum" style="margin-top:10px">' +
      "<span><b>" + Object.keys(db.visits).length + "</b><i>到访站点 / 共 " + STOPS.length + "</i></span>" +
      "<span><b>" + db.marks.length + "</b><i>行旅章</i></span>" +
      "<span><b>" + db.favs.length + "</b><i>收藏</i></span>" +
      "<span><b>" + db.routes.length + "</b><i>常用路线</i></span>" +
      "</div>" +
      '<div class="rf-bar" style="margin-top:12px"><i style="width:' + pct + '%"></i></div>' +
      '<p class="rf-muted" style="margin-top:6px">进度 ' + pct + "% · 当前 Lv." + L.lv + " " + L.name + (L.need > 0 ? "，再走 " + L.need + " 站升级" : "，已走遍三境") + "</p>" +
      "</div>" +
      '<div class="rf-panel rf-in" id="rfFavPanel" style="animation-delay:60ms"><h3>我的收藏</h3><div class="rf-actions" id="rfFavs">' + favList() + "</div></div>" +
      '<div class="rf-panel rf-in" id="rfVisitPanel" style="animation-delay:120ms"><h3>足迹打卡</h3>' + visitList() + "</div>" +
      '<div class="rf-panel rf-in" id="rfRoutePanel" style="animation-delay:180ms"><h3>常用路线</h3>' + routeList() + "</div>" +
      '<div class="rf-panel rf-in" id="rfBadgePanel" style="animation-delay:220ms"><h3>成就墙 · 圣城印记</h3>' + badgeWall() + "</div>" +
      '<div class="rf-panel rf-in" id="rfSetPanel" style="animation-delay:240ms"><h3>偏好设置</h3>' +
      '<div class="rf-field"><span>讲解语言</span><select id="rfSetLang">' +
      Object.keys(LANGS).map(function (l) { return '<option value="' + l + '"' + (l === db.set.lang ? " selected" : "") + ">" + LANGS[l] + "</option>"; }).join("") + "</select></div>" +
      '<div class="rf-field" style="margin-top:8px"><span>默认同行人</span><select id="rfSetGrp">' +
      Object.keys(GROUPS).map(function (g) { return '<option value="' + g + '"' + (g === db.set.group ? " selected" : "") + ">" + GROUPS[g].name + "</option>"; }).join("") + "</select></div>" +
      '<div class="rf-actions"><button class="rf-btn ghost mini" id="rfClear">清空本机数据</button></div>' +
      '<div class="rf-note">清空后，足迹、收藏与常用路线都会从这台设备移除。</div></div>';
    box.onclick = function (e) {
      var b = e.target.closest("[data-me-talk]");
      if (b) talk(b.dataset.meTalk, {});
    };
    box.querySelector("#rfSetLang").onchange = function () { db.set.lang = this.value; save(); };
    box.querySelector("#rfSetGrp").onchange = function () { db.set.group = this.value; save(); };
    box.querySelector("#rfClear").onclick = function () {
      if (!window.confirm("清空本机保存的足迹、收藏与常用路线？")) return;
      db = blank(); save(); mountMe(); syncCount();
    };
  }

  /* ---------------- 挂载 ---------------- */
  function page() {
    var f = (location.pathname.split("/").pop() || "home.html").toLowerCase();
    return f.replace(".html", "") || "home";
  }
  function mount() {
    var p = page();
    var planner = document.getElementById("rfPlanner");
    if (planner) mountPlanner(planner);
    if (p === "map" || document.getElementById("rfFab")) mountMap();
    if (document.getElementById("rfMe")) mountMe();
    if (document.getElementById("rfPassport")) mountMe();
    petals();
    rails();
    syncCount();
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-rufu-talk]");
      if (t) talk(t.dataset.rufuTalk, {});
      var ph = e.target.closest("[data-rufu-photo]");
      if (ph) photo();
      var fv = e.target.closest("[data-rufu-fav]");
      if (fv) {
        var on = toggleFav(fv.dataset.rufuFav, fv.dataset.name || "", "");
        fv.textContent = on ? "★ 已收藏" : "☆ 收藏";
        fv.classList.toggle("on", on);
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  /* ---------------- 对外接口 ---------------- */
  window.RUFU = {
    data: { REGIONS: REGIONS, GROUPS: GROUPS, WEATHERS: WEATHERS, LANGS: LANGS, BUDGETS: BUDGETS, STOPS: STOPS, BADGES: BADGES },
    makePlan: makePlan, talk: talk, ask: answer, photo: photo,
    toggleFav: toggleFav, findSpot: findSpot, byName: function (n) { return ALIAS[n] || null; },
    state: function () { return db; }, openSheet: openSheet, syncCount: syncCount,
    award: award, toast: rfToast,
    setQuizBest: function (n) { if (n > (db.quizBest || 0)) { db.quizBest = n; save(); } return db.quizBest; }
  };
})();
