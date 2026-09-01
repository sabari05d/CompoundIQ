export interface TickerInfo {
  name: string;
  symbol: string;
  isin: string;
  aliases?: string[];
}

const TICKER_LIST: TickerInfo[] = [
  { name: 'Reliance Industries', symbol: 'RELIANCE', isin: 'INE002A01018', aliases: ['RIL', 'Reliance'] },
  { name: 'Tata Consultancy Services', symbol: 'TCS', isin: 'INE467B01029' },
  { name: 'Hindustan Unilever', symbol: 'HINDUNILVR', isin: 'INE030A01027', aliases: ['HUL'] },
  { name: 'Infosys', symbol: 'INFY', isin: 'INE009A01021' },
  { name: 'ICICI Bank', symbol: 'ICICIBANK', isin: 'INE090A01021' },
  { name: 'HDFC Bank', symbol: 'HDFCBANK', isin: 'INE040A01034' },
  { name: 'State Bank of India', symbol: 'SBIN', isin: 'INE062A01020', aliases: ['SBI'] },
  { name: 'Bharti Airtel', symbol: 'BHARTIARTL', isin: 'INE397D01024', aliases: ['Airtel'] },
  { name: 'ITC', symbol: 'ITC', isin: 'INE154A01025' },
  { name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', isin: 'INE237A01028' },
  { name: 'Axis Bank', symbol: 'AXISBANK', isin: 'INE238A01034' },
  { name: 'Larsen & Toubro', symbol: 'LT', isin: 'INE018A01030', aliases: ['L&T'] },
  { name: 'Asian Paints', symbol: 'ASIANPAINT', isin: 'INE021A01026' },
  { name: 'Maruti Suzuki', symbol: 'MARUTI', isin: 'INE585B01010' },
  { name: 'HCL Technologies', symbol: 'HCLTECH', isin: 'INE860A01027' },
  { name: 'Bajaj Finance', symbol: 'BAJFINANCE', isin: 'INE296A01024' },
  { name: 'Wipro', symbol: 'WIPRO', isin: 'INE075A01022' },
  { name: 'Nestle India', symbol: 'NESTLEIND', isin: 'INE239A01016' },
  { name: 'Sun Pharmaceutical', symbol: 'SUNPHARMA', isin: 'INE044A01036' },
  { name: 'Mahindra & Mahindra', symbol: 'M&M', isin: 'INE101A01026', aliases: ['M&M'] },
  { name: 'Tech Mahindra', symbol: 'TECHM', isin: 'INE669C01036' },
  { name: 'Titan Company', symbol: 'TITAN', isin: 'INE280A01028' },
  { name: 'UltraTech Cement', symbol: 'ULTRACEMCO', isin: 'INE481G01011' },
  { name: 'Bajaj Finserv', symbol: 'BAJAJFINSV', isin: 'INE918I01026' },
  { name: 'Power Grid Corporation', symbol: 'POWERGRID', isin: 'INE752E01010' },
  { name: 'NTPC', symbol: 'NTPC', isin: 'INE733E01010' },
  { name: 'Tata Steel', symbol: 'TATASTEEL', isin: 'INE081A01020' },
  { name: 'Tata Motors', symbol: 'TATAMOTORS', isin: 'INE155A01022' },
  { name: 'Hindalco Industries', symbol: 'HINDALCO', isin: 'INE038A01020' },
  { name: 'JSW Steel', symbol: 'JSWSTEEL', isin: 'INE019A01038' },
  { name: 'Coal India', symbol: 'COALINDIA', isin: 'INE522F01014' },
  { name: 'Oil & Natural Gas Corporation', symbol: 'ONGC', isin: 'INE213A01029', aliases: ['ONGC'] },
  { name: 'Indian Oil Corporation', symbol: 'IOC', isin: 'INE242A01010' },
  { name: 'Bharat Petroleum Corporation', symbol: 'BPCL', isin: 'INE029A01011' },
  { name: 'Adani Enterprises', symbol: 'ADANIENT', isin: 'INE423A01024' },
  { name: 'Adani Ports & SEZ', symbol: 'ADANIPORTS', isin: 'INE742F01042' },
  { name: 'Adani Green Energy', symbol: 'ADANIGREEN', isin: 'INE364U01010' },
  { name: 'Adani Power', symbol: 'ADANIPOWER', isin: 'INE814H01011' },
  { name: 'Adani Total Gas', symbol: 'ATGL', isin: 'INE399L01023' },
  { name: 'Grasim Industries', symbol: 'GRASIM', isin: 'INE047A01021' },
  { name: 'IndusInd Bank', symbol: 'INDUSINDBK', isin: 'INE095A01012' },
  { name: 'Dr Reddys Laboratories', symbol: 'DRREDDY', isin: 'INE089A01023' },
  { name: 'Cipla', symbol: 'CIPLA', isin: 'INE059A01026' },
  { name: 'Divis Laboratories', symbol: 'DIVISLAB', isin: 'INE361B01024' },
  { name: 'Britannia Industries', symbol: 'BRITANNIA', isin: 'INE216A01030' },
  { name: 'Eicher Motors', symbol: 'EICHERMOT', isin: 'INE066A01021' },
  { name: 'Hero MotoCorp', symbol: 'HEROMOTOCO', isin: 'INE158A01026' },
  { name: 'Bajaj Auto', symbol: 'BAJAJ-AUTO', isin: 'INE917I01010' },
  { name: 'Tata Consumer Products', symbol: 'TATACONSUM', isin: 'INE192A01025' },
  { name: 'Havells India', symbol: 'HAVELLS', isin: 'INE176B01034' },
  { name: 'Siemens', symbol: 'SIEMENS', isin: 'INE003A01024' },
  { name: 'ABB India', symbol: 'ABB', isin: 'INE117A01022' },
  { name: 'Bajaj Holdings & Investment', symbol: 'BAJAJHLDNG', isin: 'INE118A01012' },
  { name: 'SBI Life Insurance', symbol: 'SBILIFE', isin: 'INE123W01016' },
  { name: 'HDFC Life Insurance', symbol: 'HDFCLIFE', isin: 'INE795G01014' },
  { name: 'ICICI Prudential Life Insurance', symbol: 'ICICIPRULI', isin: 'INE726G01019' },
  { name: 'LIC Housing Finance', symbol: 'LICHSGFIN', isin: 'INE115A01026' },
  { name: 'HDFC Asset Management', symbol: 'HDFCAMC', isin: 'INE127D01025' },
  { name: 'Berger Paints India', symbol: 'BERGEPAINT', isin: 'INE463A01038' },
  { name: 'Pidilite Industries', symbol: 'PIDILITIND', isin: 'INE318A01026' },
  { name: 'Godrej Consumer Products', symbol: 'GODREJCP', isin: 'INE102D01028' },
  { name: 'Dabur India', symbol: 'DABUR', isin: 'INE016A01026' },
  { name: 'Marico', symbol: 'MARICO', isin: 'INE196A01026' },
  { name: 'Colgate-Palmolive India', symbol: 'COLPAL', isin: 'INE259A01022' },
  { name: 'Emami', symbol: 'EMAMILTD', isin: 'INE548C01032' },
  { name: 'Page Industries', symbol: 'PAGEIND', isin: 'INE761H01022' },
  { name: 'Trent', symbol: 'TRENT', isin: 'INE849A01020' },
  { name: 'Avenue Supermarts', symbol: 'DMART', isin: 'INE192R01011', aliases: ['DMart'] },
  { name: 'Info Edge India', symbol: 'NAUKRI', isin: 'INE663F01024' },
  { name: 'Zomato', symbol: 'ZOMATO', isin: 'INE758T01015' },
  { name: 'Paytm (One97 Communications)', symbol: 'PAYTM', isin: 'INE982J01020' },
  { name: 'PolicyBazaar (PB Fintech)', symbol: 'POLICYBZR', isin: 'INE417T01026' },
  { name: 'Nykaa (FSN E-Commerce Ventures)', symbol: 'NYKAA', isin: 'INE388Y01029' },
  { name: 'Delhivery', symbol: 'DELHIVERY', isin: 'INE148O01028' },
  { name: 'IRCTC', symbol: 'IRCTC', isin: 'INE335Y01020' },
  { name: 'Rail Vikas Nigam', symbol: 'RVNL', isin: 'INE415G01027' },
  { name: 'Mazagon Dock Shipbuilders', symbol: 'MAZDOCK', isin: 'INE249Z01012' },
  { name: 'Cochin Shipyard', symbol: 'COCHINSHIP', isin: 'INE704P01025' },
  { name: 'Bharat Dynamics', symbol: 'BDL', isin: 'INE171Z01018' },
  { name: 'Hindustan Aeronautics', symbol: 'HAL', isin: 'INE066F01020' },
  { name: 'Bharat Electronics', symbol: 'BEL', isin: 'INE263A01024' },
  { name: 'AstraZeneca Pharma India', symbol: 'ASTRAZEN', isin: 'INE203A01020' },
  { name: 'GlaxoSmithKline Pharmaceuticals', symbol: 'GLAXO', isin: 'INE159A01016' },
  { name: 'Sanofi India', symbol: 'SANOFI', isin: 'INE058A01010' },
  { name: 'Torrent Pharmaceuticals', symbol: 'TORNTPHARM', isin: 'INE685A01028' },
  { name: 'Lupin', symbol: 'LUPIN', isin: 'INE326A01037' },
  { name: 'Aurobindo Pharma', symbol: 'AUROPHARMA', isin: 'INE406A01037' },
  { name: 'Cadila Healthcare', symbol: 'CADILAHC', isin: 'INE010B01027' },
  { name: 'Biocon', symbol: 'BIOCON', isin: 'INE376G01013' },
  { name: 'Gland Pharma', symbol: 'GLAND', isin: 'INE068V01023' },
  { name: 'IPCA Laboratories', symbol: 'IPCALAB', isin: 'INE571A01020' },
  { name: 'Alkem Laboratories', symbol: 'ALKEM', isin: 'INE540L01014' },
  { name: 'Laurus Labs', symbol: 'LAURUSLABS', isin: 'INE947Q01028' },
  { name: 'Natco Pharma', symbol: 'NATCOPHARM', isin: 'INE987B01026' },
  { name: 'Ajanta Pharma', symbol: 'AJANTPHARM', isin: 'INE031B01049' },
  { name: 'Alembic Pharmaceuticals', symbol: 'APLLTD', isin: 'INE901L01018' },
  { name: 'JB Chemicals & Pharmaceuticals', symbol: 'JBCHEPHARM', isin: 'INE572A01028' },
  { name: 'Glenmark Pharmaceuticals', symbol: 'GLENMARK', isin: 'INE935A01035' },
  { name: 'Wockhardt', symbol: 'WOCKPHARMA', isin: 'INE049A01027' },
  { name: 'Strides Pharma', symbol: 'STAR', isin: 'INE939C01027' },
  { name: 'Shilpa Medicare', symbol: 'SHILPAMED', isin: 'INE790G01031' },
  { name: 'Syngene International', symbol: 'SYNGENE', isin: 'INE398R01022' },
  { name: 'Metropolis Healthcare', symbol: 'METROPOLIS', isin: 'INE112L01020' },
  { name: 'Dr Lal PathLabs', symbol: 'DRLAL', isin: 'INE600L01024' },
  { name: 'Thyrocare Technologies', symbol: 'THYROCARE', isin: 'INE276A01018' },
  { name: 'Apollo Hospitals', symbol: 'APOLLOHOSP', isin: 'INE437A01024' },
  { name: 'Fortis Healthcare', symbol: 'FORTIS', isin: 'INE061F01013' },
  { name: 'Max Healthcare Institute', symbol: 'MAXHEALTH', isin: 'INE027H01010' },
  { name: 'Narayana Hrudayalaya', symbol: 'NH', isin: 'INE410P01011' },
  { name: 'Aster DM Healthcare', symbol: 'ASTERDM', isin: 'INE914M01019' },
  { name: 'Healthcare Global Enterprises', symbol: 'HCG', isin: 'INE998I01010' },
  { name: 'Thyrocare Technologies', symbol: 'THYROCARE', isin: 'INE276A01018' },
  { name: 'Persistent Systems', symbol: 'PERSISTENT', isin: 'INE262H01013' },
  { name: 'L&T Technology Services', symbol: 'LTTS', isin: 'INE010V01017' },
  { name: 'Mphasis', symbol: 'MPHASIS', isin: 'INE356A01018' },
  { name: 'Mindtree', symbol: 'MINDTREE', isin: 'INE018I01017' },
  { name: 'Larsen & Toubro Infotech', symbol: 'LTI', isin: 'INE214T01019' },
  { name: 'Coforge', symbol: 'COFORGE', isin: 'INE591G01017' },
  { name: 'Hexaware Technologies', symbol: 'HEXAWARE', isin: 'INE093A01021' },
  { name: 'Cyient', symbol: 'CYIENT', isin: 'INE136B01020' },
  { name: 'Zensar Technologies', symbol: 'ZENSARTECH', isin: 'INE520A01027' },
  { name: 'KPIT Technologies', symbol: 'KPITTECH', isin: 'INE542A01039' },
  { name: 'Tata Elxsi', symbol: 'TATAELXSI', isin: 'INE670A01012' },
  { name: 'Intellect Design Arena', symbol: 'INTELLECT', isin: 'INE306R01017' },
  { name: 'Birlasoft', symbol: 'BSOFT', isin: 'INE836A01035' },
  { name: 'Oracle Financial Services Software', symbol: 'OFSS', isin: 'INE881D01027' },
  { name: 'Mastek', symbol: 'MASTEK', isin: 'INE383A01012' },
  { name: 'NIIT Technologies', symbol: 'NIITTECH', isin: 'INE591A01010' },
  { name: 'ICRA', symbol: 'ICRA', isin: 'INE725G01011' },
  { name: 'Affle India', symbol: 'AFFLE', isin: 'INE00WC01019' },
  { name: 'Tanla Platforms', symbol: 'TANLA', isin: 'INE483C01032' },
  { name: 'Route Mobile', symbol: 'ROUTE', isin: 'INE450U01017' },
  { name: 'Nazara Technologies', symbol: 'NAZARA', isin: 'INE418L01021' },
  { name: 'Network18 Group', symbol: 'NETWORK18', isin: 'INE870H01013' },
  { name: 'TV18 Broadcast', symbol: 'TV18BRDCST', isin: 'INE886H01027' },
  { name: 'ZEEL', symbol: 'ZEEL', isin: 'INE256A01028' },
  { name: 'Sun TV Network', symbol: 'SUNTV', isin: 'INE424H01027' },
  { name: 'PVR Inox', symbol: 'PVRINOX', isin: 'INE191H01014' },
  { name: 'inox Leisure', symbol: 'INOXLEISUR', isin: 'INE794H01015' },
  { name: 'Dish TV India', symbol: 'DISHTV', isin: 'INE836H01014' },
  { name: 'Hathway Cable & Datacom', symbol: 'HATHWAY', isin: 'INE982F01036' },
  { name: 'DEN Networks', symbol: 'DEN', isin: 'INE947J01015' },
  { name: 'Siti Networks', symbol: 'SITINET', isin: 'INE965H01011' },
  { name: 'Tips Industries', symbol: 'TIPSINDLTD', isin: 'INE716B01013' },
  { name: 'Saregama India', symbol: 'SAREGAMA', isin: 'INE979A01017' },
  { name: 'Music Broadcast', symbol: 'RADIOCITY', isin: 'INE919I01024' },
  { name: 'DB Corp', symbol: 'DBCORP', isin: 'INE950I01011' },
  { name: 'Jagran Prakashan', symbol: 'JAGRAN', isin: 'INE199G01027' },
  { name: 'Hindustan Media Ventures', symbol: 'HMVL', isin: 'INE871K01015' },
  { name: 'Navneet Education', symbol: 'NAVNETEDUL', isin: 'INE060A01024' },
  { name: 'S Chand and Company', symbol: 'SCHAND', isin: 'INE807K01035' },
  { name: 'Vakrangee', symbol: 'VAKRANGEE', isin: 'INE051B01021' },
  { name: 'InfoBeans Technologies', symbol: 'INFOBEAN', isin: 'INE344A01015' },
  { name: 'Quick Heal Technologies', symbol: 'QUICKHEAL', isin: 'INE306L01010' },
  { name: 'Sequent Scientific', symbol: 'SEQUENT', isin: 'INE807F01027' },
  { name: 'Ajanta Pharma', symbol: 'AJANTPHARM', isin: 'INE031B01049' },
  { name: 'S H Kelkar and Company', symbol: 'SHK', isin: 'INE500L01026' },
  { name: 'Galaxy Surfactants', symbol: 'GALAXYSURF', isin: 'INE600K01018' },
  { name: 'Fine Organic Industries', symbol: 'FINEORG', isin: 'INE686Y01021' },
  { name: 'Atul', symbol: 'ATUL', isin: 'INE100A01010' },
  { name: 'Vinati Organics', symbol: 'VINATIORGA', isin: 'INE410B01037' },
  { name: 'SRF', symbol: 'SRF', isin: 'INE647A01010' },
  { name: 'Aarti Industries', symbol: 'AARTIIND', isin: 'INE769A01020' },
  { name: 'Navin Fluorine International', symbol: 'NAVINFLUOR', isin: 'INE048G01026' },
  { name: 'PI Industries', symbol: 'PIIND', isin: 'INE603J01030' },
  { name: 'UPL', symbol: 'UPL', isin: 'INE628A01036' },
  { name: 'Sumitomo Chemical India', symbol: 'SUMICHEM', isin: 'INE258G01013' },
  { name: 'Rallis India', symbol: 'RALLIS', isin: 'INE613A01020' },
  { name: 'Coromandel International', symbol: 'COROMANDEL', isin: 'INE169A01031' },
  { name: 'Chambal Fertilizers & Chemicals', symbol: 'CHAMBLFERT', isin: 'INE085A01013' },
  { name: 'Gujarat Narmada Valley Fertilizers', symbol: 'GNFC', isin: 'INE113A01013' },
  { name: 'Deepak Fertilisers & Petrochemicals', symbol: 'DEEPAKFERT', isin: 'INE501A01019' },
  { name: 'Krishna Institute of Medical Sciences', symbol: 'KIMS', isin: 'INE967H01017' },
  { name: 'Venus Remedies', symbol: 'VENUSREM', isin: 'INE411B01019' },
  { name: 'Mangalore Refinery & Petrochemicals', symbol: 'MRPL', isin: 'INE103A01014' },
  { name: 'Hindustan Petroleum Corporation', symbol: 'HINDPETRO', isin: 'INE094A01015' },
  { name: 'Chennai Petroleum Corporation', symbol: 'CHENNPETRO', isin: 'INE178A01016' },
  { name: 'GAIL (India)', symbol: 'GAIL', isin: 'INE129A01019' },
  { name: 'Petronet LNG', symbol: 'PETRONET', isin: 'INE347G01014' },
  { name: 'Gujarat Gas', symbol: 'GUJGASLTD', isin: 'INE844O01030' },
  { name: 'Mahanagar Gas', symbol: 'MGL', isin: 'INE002S01010' },
  { name: 'Indraprastha Gas', symbol: 'IGL', isin: 'INE203G01027' },
  { name: 'Gujarat State Petronet', symbol: 'GSPL', isin: 'INE246F01010' },
  { name: 'Saurashtra Cement', symbol: 'SAURASHCEM', isin: 'INE626A01014' },
  { name: 'India Cements', symbol: 'INDIACEM', isin: 'INE383A01012' },
  { name: 'Dalmia Bharat', symbol: 'DALBHARAT', isin: 'INE00O201026' },
  { name: 'Ambuja Cements', symbol: 'AMBUJACEM', isin: 'INE079A01024' },
  { name: 'ACC', symbol: 'ACC', isin: 'INE012A01025' },
  { name: 'Shree Cement', symbol: 'SHREECEM', isin: 'INE070A01015' },
  { name: 'Ramco Cements', symbol: 'RAMCOCEM', isin: 'INE331A01037' },
  { name: 'JK Cement', symbol: 'JKCEMENT', isin: 'INE823G01014' },
  { name: 'Century Plyboards (India)', symbol: 'CENTURYPLY', isin: 'INE348A01023' },
  { name: 'Greenply Industries', symbol: 'GREENPLY', isin: 'INE461C01038' },
  { name: 'Astral', symbol: 'ASTRAL', isin: 'INE006I01046' },
  { name: 'Supreme Industries', symbol: 'SUPREMEIND', isin: 'INE195A01028' },
  { name: 'Finolex Industries', symbol: 'FINPIPE', isin: 'INE183A01024' },
  { name: 'Finolex Cables', symbol: 'FINCABLES', isin: 'INE235A01022' },
  { name: 'KEI Industries', symbol: 'KEI', isin: 'INE878B01027' },
  { name: 'Polycab India', symbol: 'POLYCAB', isin: 'INE455K01017' },
  { name: 'Havells India', symbol: 'HAVELLS', isin: 'INE176B01034' },
  { name: 'Crompton Greaves Consumer Electricals', symbol: 'CROMPTON', isin: 'INE299U01018' },
  { name: 'Voltas', symbol: 'VOLTAS', isin: 'INE226A01021' },
  { name: 'Blue Star', symbol: 'BLUESTARCO', isin: 'INE472A01039' },
  { name: 'Whirlpool of India', symbol: 'WHIRLPOOL', isin: 'INE716A01013' },
  { name: 'TTK Prestige', symbol: 'TTKPRESTIG', isin: 'INE690A01020' },
  { name: 'Bajaj Electricals', symbol: 'BAJAJELEC', isin: 'INE193E01025' },
  { name: 'V-Guard Industries', symbol: 'VGUARD', isin: 'INE951I01027' },
  { name: 'Symphony', symbol: 'SYMPHONY', isin: 'INE225D01011' },
  { name: 'Orient Electric', symbol: 'ORIENTELEC', isin: 'INE142Z01019' },
  { name: 'Bata India', symbol: 'BATAINDIA', isin: 'INE176A01028' },
  { name: 'Relaxo Footwears', symbol: 'RELAXO', isin: 'INE131B01039' },
  { name: 'Metro Brands', symbol: 'METROPOLIS', isin: 'INE317F01035' },
  { name: 'Aditya Birla Fashion and Retail', symbol: 'ABFRL', isin: 'INE647O01011' },
  { name: 'Trent', symbol: 'TRENT', isin: 'INE849A01020' },
  { name: 'Shoppers Stop', symbol: 'SHOPERSTOP', isin: 'INE498B01024' },
  { name: 'Vishal Mega Mart', symbol: 'VMM', isin: 'INE1PSY01011' },
  { name: 'V-Mart Retail', symbol: 'VMART', isin: 'INE665K01019' },
  { name: 'Future Lifestyle Fashions', symbol: 'FLFL', isin: 'INE452O01022' },
  { name: 'Future Retail', symbol: 'FRETAIL', isin: 'INE752P01024' },
  { name: 'Future Consumer', symbol: 'FCONSUMER', isin: 'INE220J01025' },
  { name: 'Spencer\'s Retail', symbol: 'SPENCERS', isin: 'INE020R01015' },
  { name: 'K Raheja Corp Investment Trust', symbol: 'RKFORGE', isin: 'INE399G01015' },
  { name: 'Phoenix Mills', symbol: 'PHOENIXLTD', isin: 'INE211B01039' },
  { name: 'DLF', symbol: 'DLF', isin: 'INE271C01023' },
  { name: 'Oberoi Realty', symbol: 'OBEROIRLTY', isin: 'INE093I01010' },
  { name: 'Godrej Properties', symbol: 'GODREJPROP', isin: 'INE484J01027' },
  { name: 'Brigade Enterprises', symbol: 'BRIGADE', isin: 'INE791I01019' },
  { name: 'Prestige Estates Projects', symbol: 'PRESTIGE', isin: 'INE811K01011' },
  { name: 'Sobha', symbol: 'SOBHA', isin: 'INE671H01015' },
  { name: 'Lodha Developers (Macrotech Developers)', symbol: 'LODHA', isin: 'INE670K01029' },
  { name: 'Mahindra Lifespace Developers', symbol: 'MAHLIFE', isin: 'INE813A01018' },
  { name: 'Sunteck Realty', symbol: 'SUNTECK', isin: 'INE805D01034' },
  { name: 'Puravankara', symbol: 'PURVA', isin: 'INE323I01011' },
  { name: 'L&T Finance Holdings', symbol: 'L&TFH', isin: 'INE498L01015' },
  { name: 'Bajaj Finserv', symbol: 'BAJAJFINSV', isin: 'INE918I01026' },
  { name: 'Cholamandalam Investment and Finance', symbol: 'CHOLAFIN', isin: 'INE121A01024' },
  { name: 'Shriram Transport Finance', symbol: 'SRTRANSFIN', isin: 'INE721A01047' },
  { name: 'Mahindra & Mahindra Financial Services', symbol: 'M&MFIN', isin: 'INE774D01010' },
  { name: 'Muthoot Finance', symbol: 'MUTHOOTFIN', isin: 'INE414G01012' },
  { name: 'Manappuram Finance', symbol: 'MANAPPURAM', isin: 'INE522D01027' },
  { name: 'Aditya Birla Capital', symbol: 'ABCAPITAL', isin: 'INE674K01013' },
  { name: 'Piramal Enterprises', symbol: 'PEL', isin: 'INE140A01024' },
  { name: 'Bajaj Holdings & Investment', symbol: 'BAJAJHLDNG', isin: 'INE118A01012' },
  { name: 'Sundaram Finance', symbol: 'SUNDARMFIN', isin: 'INE308A01027' },
  { name: 'Cholamandalam Financial Holdings', symbol: 'CHOLAHLDNG', isin: 'INE150A01015' },
  { name: 'ICRA', symbol: 'ICRA', isin: 'INE725G01011' },
  { name: 'CreditAccess Grameen', symbol: 'CREDITACC', isin: 'INE741K01010' },
  { name: 'Spandana Sphoorty Financial', symbol: 'SPANDANA', isin: 'INE572J01011' },
  { name: 'Bandhan Bank', symbol: 'BANDHANBNK', isin: 'INE545U01014' },
  { name: 'AU Small Finance Bank', symbol: 'AUBANK', isin: 'INE949L01017' },
  { name: 'City Union Bank', symbol: 'CUB', isin: 'INE491A01021' },
  { name: 'Karur Vysya Bank', symbol: 'KARURVYSYA', isin: 'INE036D01028' },
  { name: 'Federal Bank', symbol: 'FEDERALBNK', isin: 'INE171A01029' },
  { name: 'RBL Bank', symbol: 'RBLBANK', isin: 'INE976G01028' },
  { name: 'Yes Bank', symbol: 'YESBANK', isin: 'INE528G01035' },
  { name: 'DCB Bank', symbol: 'DCBBANK', isin: 'INE503A01015' },
  { name: 'Equitas Small Finance Bank', symbol: 'EQUITASBNK', isin: 'INE063P01018' },
  { name: 'Ujjivan Small Finance Bank', symbol: 'UJJIVANSFB', isin: 'INE551W01018' },
  { name: 'Indian Bank', symbol: 'INDIANB', isin: 'INE562A01011' },
  { name: 'Bank of Baroda', symbol: 'BANKBARODA', isin: 'INE028A01039' },
  { name: 'Punjab National Bank', symbol: 'PNB', isin: 'INE160A01022' },
  { name: 'Canara Bank', symbol: 'CANBK', isin: 'INE476A01014' },
  { name: 'Union Bank of India', symbol: 'UNIONBANK', isin: 'INE692A01016' },
  { name: 'Bank of India', symbol: 'BANKINDIA', isin: 'INE084A01016' },
  { name: 'Central Bank of India', symbol: 'CENTRALBK', isin: 'INE483A01010' },
  { name: 'Indian Overseas Bank', symbol: 'IOB', isin: 'INE565A01014' },
  { name: 'UCO Bank', symbol: 'UCOBANK', isin: 'INE118A01012' },
  { name: 'IDFC First Bank', symbol: 'IDFCFIRSTB', isin: 'INE092T01019' },
  { name: 'CSB Bank', symbol: 'CSBBANK', isin: 'INE679A01013' },
  { name: 'South Indian Bank', symbol: 'SIB', isin: 'INE683A01023' },
  { name: 'Karnataka Bank', symbol: 'KTKBANK', isin: 'INE614B01018' },
  { name: 'Jammu & Kashmir Bank', symbol: 'J&KBANK', isin: 'INE168A01041' },
  { name: 'Tamilnad Mercantile Bank', symbol: 'TMB', isin: 'INE668A01016' },
  { name: 'Dhanlaxmi Bank', symbol: 'DHANBANK', isin: 'INE680A01011' },
  { name: 'ICICI Securities', symbol: 'ISEC', isin: 'INE763G01020' },
  { name: 'Motilal Oswal Financial Services', symbol: 'MOTILALOFS', isin: 'INE338I01027' },
  { name: 'Edelweiss Financial Services', symbol: 'EDELWEISS', isin: 'INE532F01054' },
  { name: 'IIFL Securities', symbol: 'IIFLSEC', isin: 'INE489L01022' },
  { name: 'BSE', symbol: 'BSE', isin: 'INE118H01025' },
  { name: 'Multi Commodity Exchange of India', symbol: 'MCX', isin: 'INE745G01035' },
  { name: 'Indian Energy Exchange', symbol: 'IEX', isin: 'INE022Q01020' },
  { name: 'Central Depository Services (India)', symbol: 'CDSL', isin: 'INE736A01011' },
  { name: 'Kfin Technologies', symbol: 'KFINTECH', isin: 'INE138Y01010' },
  { name: 'Computer Age Management Services', symbol: 'CAMS', isin: 'INE596I01012' },
  { name: 'Borosil', symbol: 'BOROSIL', isin: 'INE02PY01013' },
  { name: 'Borosil Scientific', symbol: 'BOROSCI', isin: 'INE02NC01014' },
  { name: 'Schaeffler India', symbol: 'SCHAEFFLER', isin: 'INE513A01022' },
  { name: 'Timken India', symbol: 'TIMKEN', isin: 'INE325A01013' },
  { name: 'SKF India', symbol: 'SKFINDIA', isin: 'INE640A01023' },
  { name: 'Bosch', symbol: 'BOSCHLTD', isin: 'INE323A01026' },
  { name: 'Bharat Forge', symbol: 'BHARATFORG', isin: 'INE465A01025' },
  { name: 'Endurance Technologies', symbol: 'ENDURANCE', isin: 'INE913H01037' },
  { name: 'Motherson Sumi Wiring India', symbol: 'MSUMI', isin: 'INE0FS801013' },
  { name: 'Samvardhana Motherson International', symbol: 'MOTHERSON', isin: 'INE775A01035' },
  { name: 'Uno Minda', symbol: 'UNOMINDA', isin: 'INE405E01023' },
  { name: 'Bosch', symbol: 'BOSCHLTD', isin: 'INE323A01026' },
  { name: 'Wheels India', symbol: 'WHEELS', isin: 'INE715A01015' },
  { name: 'Sundaram Fasteners', symbol: 'SUNDRMFAST', isin: 'INE387A01021' },
  { name: 'Gabriel India', symbol: 'GABRIEL', isin: 'INE640A01023' },
  { name: 'Minda Industries', symbol: 'MINDAIND', isin: 'INE405E01023' },
  { name: 'Exide Industries', symbol: 'EXIDEIND', isin: 'INE302A01020' },
  { name: 'Amara Raja Batteries', symbol: 'AMARAJABAT', isin: 'INE885A01032' },
  { name: 'HBL Power Systems', symbol: 'HBLPOWER', isin: 'INE813B01022' },
  { name: 'Sundaram-Clayton', symbol: 'SUNCLAYTON', isin: 'INE105A01035' },
  { name: 'Tube Investments of India', symbol: 'TIINDIA', isin: 'INE974X01010' },
  { name: 'India Nippon Electricals', symbol: 'INDNIPPON', isin: 'INE092B01017' },
  { name: 'Sona BLW Precision Forgings', symbol: 'SONACOMS', isin: 'INE073K01018' },
  { name: 'Bharat Bijlee', symbol: 'BBL', isin: 'INE464A01028' },
  { name: 'CG Power and Industrial Solutions', symbol: 'CGPOWER', isin: 'INE067A01029' },
  { name: 'Apar Industries', symbol: 'APARINDS', isin: 'INE372A01015' },
  { name: 'KEI Industries', symbol: 'KEI', isin: 'INE878B01027' },
  { name: 'Finolex Cables', symbol: 'FINCABLES', isin: 'INE235A01022' },
  { name: 'Sterlite Technologies', symbol: 'STLTECH', isin: 'INE089C01029' },
  { name: 'Vindhya Telelinks', symbol: 'VINDHYATEL', isin: 'INE707A01012' },
  { name: 'Optiemus Infracom', symbol: 'OPTIEMUS', isin: 'INE350C01017' },
  { name: 'Astra Microwave Products', symbol: 'ASTRAMICRO', isin: 'INE386C01029' },
  { name: 'Birlasoft', symbol: 'BSOFT', isin: 'INE836A01035' },
  { name: 'Cyient', symbol: 'CYIENT', isin: 'INE136B01020' },
  { name: 'KPIT Technologies', symbol: 'KPITTECH', isin: 'INE542A01039' },
  { name: 'Persistent Systems', symbol: 'PERSISTENT', isin: 'INE262H01013' },
  { name: 'Tata Communications', symbol: 'TATACOMM', isin: 'INE151A01013' },
  { name: 'Vodafone Idea', symbol: 'IDEA', isin: 'INE669E01016' },
  { name: 'Tata Teleservices (Maharashtra)', symbol: 'TTML', isin: 'INE517B01013' },
  { name: 'HFCL', symbol: 'HFCL', isin: 'INE548A01022' },
  { name: 'Tejas Networks', symbol: 'TEJASNET', isin: 'INE010J01012' },
  { name: 'Sterlite Technologies', symbol: 'STLTECH', isin: 'INE089C01029' },
  { name: 'Mahanagar Telephone Nigam', symbol: 'MTNL', isin: 'INE153A01019' },
  { name: 'ITI', symbol: 'ITI', isin: 'INE248A01017' },
  { name: 'RailTel Corporation of India', symbol: 'RAILTEL', isin: 'INE0DD301028' },
  { name: 'Brightcom Group', symbol: 'BCG', isin: 'INE425B01027' },
];

let tickerMap: Map<string, TickerInfo> | null = null;
let nameMap: Map<string, TickerInfo> | null = null;

function buildIndexes() {
  if (tickerMap && nameMap) return;

  tickerMap = new Map();
  nameMap = new Map();

  for (const ticker of TICKER_LIST) {
    tickerMap.set(ticker.symbol.toUpperCase(), ticker);
    nameMap.set(normalizeString(ticker.name), ticker);
    for (const alias of ticker.aliases || []) {
      nameMap.set(normalizeString(alias), ticker);
    }
  }
}

function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b(pvt|private|ltd|limited|india|industries|corporation|company|co|inc)\b\.?/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshtein(a, b);
  return 1 - distance / maxLen;
}

export interface MatchResult {
  ticker: TickerInfo | null;
  confidence: number;
}

export function matchTicker(companyName: string): MatchResult {
  buildIndexes();
  if (!companyName || !companyName.trim()) {
    return { ticker: null, confidence: 0 };
  }

  const normalizedInput = normalizeString(companyName);
  if (!normalizedInput) {
    return { ticker: null, confidence: 0 };
  }

  // Exact match
  const exact = nameMap!.get(normalizedInput);
  if (exact) {
    return { ticker: exact, confidence: 1 };
  }

  // Contains match
  for (const [key, ticker] of nameMap!.entries()) {
    if (key && (normalizedInput.includes(key) || key.includes(normalizedInput))) {
      const conf = similarity(normalizedInput, key);
      if (conf > 0.7) {
        return { ticker, confidence: conf };
      }
    }
  }

  // Fuzzy match using similarity
  let bestMatch: TickerInfo | null = null;
  let bestScore = 0;

  for (const [key, ticker] of nameMap!.entries()) {
    const score = similarity(normalizedInput, key);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = ticker;
    }
  }

  if (bestScore >= 0.85 && bestMatch) {
    return { ticker: bestMatch, confidence: bestScore };
  }

  return { ticker: null, confidence: bestScore };
}

export function getTickerBySymbol(symbol: string): TickerInfo | null {
  buildIndexes();
  return tickerMap!.get(symbol.toUpperCase()) || null;
}

export function getAllTickers(): TickerInfo[] {
  return [...TICKER_LIST];
}

export const TICKER_MATCH_CONFIDENCE_THRESHOLD = 0.85;