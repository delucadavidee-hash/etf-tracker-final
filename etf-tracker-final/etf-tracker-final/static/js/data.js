// ═══════════════════════════════════════════
// ETF Tracker - Static Data
// ═══════════════════════════════════════════

const ETF_DATABASE = [
    {"isin":"IE00B4L5Y983","ticker":"VWCE","name":"Vanguard FTSE All-World","price":118.50,"chg1d":0.45,"chg1y":12.3,"ter":0.22,"aum":1850000,"asset":"Azionario","region":"Globale","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"Vanguard","rating":5,"chg5y":52.0},
    {"isin":"IE00B4L5YY86","ticker":"IWDA","name":"iShares Core MSCI World","price":85.20,"chg1d":0.32,"chg1y":14.1,"ter":0.20,"aum":980000,"asset":"Azionario","region":"Globale","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"BlackRock","rating":5,"chg5y":55.0},
    {"isin":"IE00BDBRDM35","ticker":"EUNL","name":"iShares Core Euro STOXX 50","price":42.80,"chg1d":0.18,"chg1y":8.5,"ter":0.10,"aum":125000,"asset":"Azionario","region":"Europa","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"BlackRock","rating":4,"chg5y":28.0},
    {"isin":"IE00BDBRDM43","ticker":"EXS1","name":"iShares STOXX Europe 600","price":95.40,"chg1d":0.25,"chg1y":9.2,"ter":0.20,"aum":85000,"asset":"Azionario","region":"Europa","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"BlackRock","rating":4,"chg5y":30.0},
    {"isin":"IE00BKM4GZ66","ticker":"EMAE","name":"iShares Core MSCI EM IMI","price":32.15,"chg1d":0.85,"chg1y":6.8,"ter":0.18,"aum":145000,"asset":"Azionario","region":"Emergenti","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"BlackRock","rating":4,"chg5y":18.0},
    {"isin":"IE00BDBRDM51","ticker":"IUSN","name":"iShares MSCI World Small Cap","price":8.95,"chg1d":0.42,"chg1y":11.5,"ter":0.35,"aum":42000,"asset":"Azionario","region":"Globale","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"BlackRock","rating":4,"chg5y":35.0},
    {"isin":"IE00BDBRDM69","ticker":"IBGL","name":"iShares Euro Government Bond","price":136.20,"chg1d":-0.15,"chg1y":-2.1,"ter":0.09,"aum":185000,"asset":"Obbligazionario","region":"Europa","replication":"Fisica","distribution":"Distribuzione","domicile":"Irlanda","issuer":"BlackRock","rating":4,"chg5y":-8.0},
    {"isin":"IE00BDBRDM77","ticker":"IEGA","name":"iShares Core Euro Gov Bond","price":128.50,"chg1d":-0.12,"chg1y":-1.8,"ter":0.12,"aum":95000,"asset":"Obbligazionario","region":"Europa","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"BlackRock","rating":4,"chg5y":-6.0},
    {"isin":"IE00BDBRDM85","ticker":"IBCI","name":"iShares Inflation Linked Govt","price":68.40,"chg1d":0.08,"chg1y":1.2,"ter":0.10,"aum":32000,"asset":"Obbligazionario","region":"Europa","replication":"Fisica","distribution":"Distribuzione","domicile":"Irlanda","issuer":"BlackRock","rating":4,"chg5y":5.0},
    {"isin":"IE00BDBRDM93","ticker":"XAD1","name":"Xtrackers MSCI AC World","price":98.75,"chg1d":0.38,"chg1y":13.5,"ter":0.19,"aum":65000,"asset":"Azionario","region":"Globale","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"DWS","rating":4,"chg5y":50.0},
    {"isin":"IE00BDBRDM01","ticker":"XBLC","name":"Xtrackers MSCI World Momentum","price":62.30,"chg1d":0.55,"chg1y":16.2,"ter":0.30,"aum":28000,"asset":"Azionario","region":"Globale","replication":"Campionamento","distribution":"Accumulazione","domicile":"Irlanda","issuer":"DWS","rating":4,"chg5y":58.0},
    {"isin":"IE00BDBRDM19","ticker":"Xetra-Gold","name":"Xetra-Gold","price":48.90,"chg1d":0.22,"chg1y":18.5,"ter":0.36,"aum":7800,"asset":"Commodities","region":"Globale","replication":"Fisica","distribution":"Accumulazione","domicile":"Germania","issuer":"Deutsche Borse","rating":3,"chg5y":42.0},
    {"isin":"IE00BDBRDM27","ticker":"IUSQ","name":"iShares MSCI ACWI","price":92.40,"chg1d":0.40,"chg1y":12.8,"ter":0.20,"aum":89000,"asset":"Azionario","region":"Globale","replication":"Fisica","distribution":"Accumulazione","domicile":"Irlanda","issuer":"BlackRock","rating":5,"chg5y":51.0},
];

const MODEL_PORTFOLIOS = [
    {"id":"all-weather","name":"All-Weather","author":"Ray Dalio","risk":"Medio","riskLevel":3,"cagr":7.8,"maxDD":"-14.5","sharpe":0.72,"philosophy":"Asset allocation che performa in ogni condizione macroeconomica","allocation":[{"name":"Azionario","value":30,"color":"#0A2540"},{"name":"Obbligazionario","value":40,"color":"#1E5AA0"},{"name":"Oro","value":15,"color":"#D69E2E"},{"name":"Commodities","value":15,"color":"#68A063"}]},
    {"id":"bogleheads","name":"Bogleheads 3-Fund","author":"John Bogle","risk":"Medio","riskLevel":3,"cagr":8.2,"maxDD":"-18.3","sharpe":0.68,"philosophy":"Semplicita totale: azionario globale + obbligazionario + emergenti","allocation":[{"name":"Azionario Global","value":60,"color":"#0A2540"},{"name":"Emergenti","value":20,"color":"#1E5AA0"},{"name":"Obbligazionario","value":20,"color":"#8A94A6"}]},
    {"id":"permanent","name":"Permanent Portfolio","author":"Harry Browne","risk":"Basso","riskLevel":2,"cagr":5.4,"maxDD":"-8.1","sharpe":0.55,"philosophy":"Equa ripartizione per proteggere da ogni scenario economico","allocation":[{"name":"Azionario","value":25,"color":"#0A2540"},{"name":"Obbligazionario","value":25,"color":"#1E5AA0"},{"name":"Oro","value":25,"color":"#D69E2E"},{"name":"Cash","value":25,"color":"#8A94A6"}]},
    {"id":"coffeehouse","name":"Coffeehouse Portfolio","author":"Bill Schultheis","risk":"Basso","riskLevel":2,"cagr":6.8,"maxDD":"-12.4","sharpe":0.62,"philosophy":"Diversificazione estrema con 10 asset class","allocation":[{"name":"Large Cap","value":10,"color":"#0A2540"},{"name":"Large Value","value":10,"color":"#1E3A5F"},{"name":"Small Cap","value":10,"color":"#1E5AA0"},{"name":"Small Value","value":10,"color":"#0F7B3F"},{"name":"REITs","value":10,"color":"#68A063"},{"name":"Gov Bond","value":10,"color":"#D69E2E"},{"name":"Corp Bond","value":10,"color":"#8A94A6"},{"name":"TIPS","value":10,"color":"#4A5568"},{"name":"Emergenti","value":10,"color":"#2D3748"},{"name":"EAFE","value":10,"color":"#061528"}]},
    {"id":"golden","name":"Golden Butterfly","author":"Tyler","risk":"Medio-Basso","riskLevel":2,"cagr":7.1,"maxDD":"-11.2","sharpe":0.70,"philosophy":"Variante Permanent con tilt value e small cap","allocation":[{"name":"S&P 500","value":20,"color":"#0A2540"},{"name":"Small Cap Value","value":20,"color":"#1E3A5F"},{"name":"Long Gov Bond","value":20,"color":"#1E5AA0"},{"name":"Short Gov Bond","value":20,"color":"#8A94A6"},{"name":"Oro","value":20,"color":"#D69E2E"}]},
    {"id":"growth","name":"100% Growth","author":"ETF Tracker","risk":"Alto","riskLevel":4,"cagr":10.5,"maxDD":"-28.7","sharpe":0.58,"philosophy":"Massima esposizione azionaria per obiettivi di crescita","allocation":[{"name":"Azionario Global","value":70,"color":"#0A2540"},{"name":"Small Cap","value":20,"color":"#1E3A5F"},{"name":"Emergenti","value":10,"color":"#0F7B3F"}]},
];

const CORRELATION_MATRIX = [
    {"etf":"VWCE","VWCE":1.0,"IWDA":0.96,"EUNL":0.88,"EXS1":0.90,"EMAE":0.82,"IUSN":0.93,"IBGL":0.15,"IEGA":0.18,"IBCI":0.22,"XAD1":0.97,"XBLC":0.95,"Xetra-Gold":-0.08,"IUSQ":0.98},
    {"etf":"IWDA","VWCE":0.96,"IWDA":1.0,"EUNL":0.85,"EXS1":0.87,"EMAE":0.78,"IUSN":0.91,"IBGL":0.12,"IEGA":0.15,"IBCI":0.18,"XAD1":0.99,"XBLC":0.96,"Xetra-Gold":-0.12,"IUSQ":0.97},
    {"etf":"EUNL","VWCE":0.88,"IWDA":0.85,"EUNL":1.0,"EXS1":0.95,"EMAE":0.65,"IUSN":0.78,"IBGL":0.25,"IEGA":0.28,"IBCI":0.30,"XAD1":0.86,"XBLC":0.82,"Xetra-Gold":-0.05,"IUSQ":0.88},
    {"etf":"EXS1","VWCE":0.90,"IWDA":0.87,"EUNL":0.95,"EXS1":1.0,"EMAE":0.70,"IUSN":0.80,"IBGL":0.22,"IEGA":0.25,"IBCI":0.28,"XAD1":0.88,"XBLC":0.84,"Xetra-Gold":-0.02,"IUSQ":0.90},
    {"etf":"EMAE","VWCE":0.82,"IWDA":0.78,"EUNL":0.65,"EXS1":0.70,"EMAE":1.0,"IUSN":0.75,"IBGL":-0.05,"IEGA":-0.02,"IBCI":0.05,"XAD1":0.80,"XBLC":0.78,"Xetra-Gold":0.10,"IUSQ":0.83},
    {"etf":"IUSN","VWCE":0.93,"IWDA":0.91,"EUNL":0.78,"EXS1":0.80,"EMAE":0.75,"IUSN":1.0,"IBGL":0.08,"IEGA":0.10,"IBCI":0.12,"XAD1":0.92,"XBLC":0.94,"Xetra-Gold":-0.10,"IUSQ":0.93},
    {"etf":"IBGL","VWCE":0.15,"IWDA":0.12,"EUNL":0.25,"EXS1":0.22,"EMAE":-0.05,"IUSN":0.08,"IBGL":1.0,"IEGA":0.95,"IBCI":0.88,"XAD1":0.15,"XBLC":0.10,"Xetra-Gold":0.35,"IUSQ":0.14},
    {"etf":"IEGA","VWCE":0.18,"IWDA":0.15,"EUNL":0.28,"EXS1":0.25,"EMAE":-0.02,"IUSN":0.10,"IBGL":0.95,"IEGA":1.0,"IBCI":0.85,"XAD1":0.18,"XBLC":0.14,"Xetra-Gold":0.32,"IUSQ":0.17},
    {"etf":"IBCI","VWCE":0.22,"IWDA":0.18,"EUNL":0.30,"EXS1":0.28,"EMAE":0.05,"IUSN":0.12,"IBGL":0.88,"IEGA":0.85,"IBCI":1.0,"XAD1":0.22,"XBLC":0.20,"Xetra-Gold":0.38,"IUSQ":0.23},
    {"etf":"XAD1","VWCE":0.97,"IWDA":0.99,"EUNL":0.86,"EXS1":0.88,"EMAE":0.80,"IUSN":0.92,"IBGL":0.15,"IEGA":0.18,"IBCI":0.22,"XAD1":1.0,"XBLC":0.97,"Xetra-Gold":-0.10,"IUSQ":0.99},
    {"etf":"XBLC","VWCE":0.95,"IWDA":0.96,"EUNL":0.82,"EXS1":0.84,"EMAE":0.78,"IUSN":0.94,"IBGL":0.10,"IEGA":0.14,"IBCI":0.20,"XAD1":0.97,"XBLC":1.0,"Xetra-Gold":-0.08,"IUSQ":0.96},
    {"etf":"Xetra-Gold","VWCE":-0.08,"IWDA":-0.12,"EUNL":-0.05,"EXS1":-0.02,"EMAE":0.10,"IUSN":-0.10,"IBGL":0.35,"IEGA":0.32,"IBCI":0.38,"XAD1":-0.10,"XBLC":-0.08,"Xetra-Gold":1.0,"IUSQ":-0.09},
    {"etf":"IUSQ","VWCE":0.98,"IWDA":0.97,"EUNL":0.88,"EXS1":0.90,"EMAE":0.83,"IUSN":0.93,"IBGL":0.14,"IEGA":0.17,"IBCI":0.23,"XAD1":0.99,"XBLC":0.96,"Xetra-Gold":-0.09,"IUSQ":1.0},
];

const ACADEMY_COURSES = [
    {"id":"abc-etf","title":"L'ABC degli ETF","level":"Base","duration":"3h","lessons":8},
    {"id":"analisi-etf","title":"Analisi e Confronto","level":"Intermedio","duration":"4h","lessons":10},
    {"id":"strategie","title":"Strategie Portafoglio","level":"Avanzato","duration":"6h","lessons":12},
    {"id":"tassazione","title":"Tassazione e Dichiarazione","level":"Intermedio","duration":"2h","lessons":5},
    {"id":"rischio","title":"Risk Management","level":"Avanzato","duration":"4h","lessons":7},
    {"id":"etf-vs-fondi","title":"ETF vs Fondi vs Azioni","level":"Base","duration":"2h","lessons":4},
];

const MANUAL_MODULES = [
    {"id":"mod0","title":"Modulo 0: Premessa","subtitle":"Prima di cominciare","icon":"book-open","color":"#E8EEF3","chapters":[
        {"id":"ch0-1","num":"0.1","title":"Per chi e questo manuale","readTime":"3 min"},
        {"id":"ch0-2","num":"0.2","title":"Come usare questa guida","readTime":"2 min"},
    ]},
    {"id":"mod1","title":"Modulo 1: Fondamenti","subtitle":"Dalle basi alla scelta","icon":"layers","color":"#E0EDFF","chapters":[
        {"id":"ch1-1","num":"1.1","title":"Cos'e un ETF","readTime":"5 min"},
        {"id":"ch1-2","num":"1.2","title":"Replica fisica vs sintetica","readTime":"4 min"},
        {"id":"ch1-3","num":"1.3","title":"TER, NAV e Tracking Error","readTime":"6 min"},
        {"id":"ch1-4","num":"1.4","title":"Scegliere il giusto ETF","readTime":"7 min"},
        {"id":"ch1-5","num":"1.5","title":"Dove acquistare","readTime":"5 min"},
    ]},
    {"id":"mod2","title":"Modulo 2: Pratica","subtitle":"Dalla teoria al portafoglio","icon":"pie-chart","color":"#E6F4EC","chapters":[
        {"id":"ch2-1","num":"2.1","title":"Costruire il primo portafoglio","readTime":"8 min"},
        {"id":"ch2-2","num":"2.2","title":"Asset Allocation","readTime":"10 min"},
        {"id":"ch2-3","num":"2.3","title":"PAC vs PIC","readTime":"6 min"},
        {"id":"ch2-4","num":"2.4","title":"Ribilanciamento","readTime":"7 min"},
        {"id":"ch2-5","num":"2.5","title":"Tassazione in Italia","readTime":"9 min"},
        {"id":"ch2-6","num":"2.6","title":"Dichiarazione redditi","readTime":"8 min"},
    ]},
];

const CHAPTER_SUMMARIES = {
    "ch1-1": {"title":"Cos'e un ETF","keyPoints":["ETF = Exchange Traded Fund: fondo negoziato in borsa","Traccia un indice (es. MSCI World) in modo passivo","Diversificazione implicita in un singolo titolo","Costi bassi (TER 0.05%-0.50%) vs fondi attivi (1-2%)","Liquidita: compra/vendi in tempo reale come un azione"]},
    "ch1-2": {"title":"Replica fisica vs sintetica","keyPoints":["Replica fisica: detiene davvero i titoli dell indice","Replica sintetica: usa swap con una controparte","Campione: replica fisica su sottoinsieme di titoli","Fisica = trasparenza maggiore, costi leggermente superiori","Sintetica = tracking error minore ma rischio controparte"]},
    "ch1-3": {"title":"TER, NAV e Tracking Error","keyPoints":["TER = Total Expense Ratio: costo annuo sul patrimonio","NAV = Net Asset Value: valore rezzo del fondo","Tracking Error = scostamento tra rendimento ETF e indice","Premiums/Discounts: NAV vs prezzo di mercato","Costi impliciti: swap fee, lending revenue, tasse"]},
    "ch2-1": {"title":"Costruire il primo portafoglio","keyPoints":["Inizia con 1-3 ETF massimo per semplicita","Core-satellite: 70-80% core globale, 20-30% tematici","Ottieni esposizione a migliaia di titoli con pochi ETF","Considera la tua propensione al rischio e orizzonte","Investi solo capitale che non ti serve a breve termine"]},
    "ch2-2": {"title":"Asset Allocation","keyPoints":["Allocazione = come dividi il capitale tra asset class","Rule of 100: 100 - eta = % azionario (approssimativo)","Diversificazione tra geografie, settori, dimensioni","Rebalancing: riporta le % ai target a intervalli regolari","L'asset allocation spiega il 90% della performance"]},
};
