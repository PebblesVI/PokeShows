/**
 * Static lookup of US city coordinates.
 * Covers major metros, state capitals, and cities commonly found in card show data.
 * Keys are normalized as "city|state" (lowercase city, uppercase state).
 */

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // --- Major Metros & Cities ---
  // New York Metro
  'new york|NY': { lat: 40.7128, lng: -74.0060 },
  'brooklyn|NY': { lat: 40.6782, lng: -73.9442 },
  'queens|NY': { lat: 40.7282, lng: -73.7949 },
  'bronx|NY': { lat: 40.8448, lng: -73.8648 },
  'staten island|NY': { lat: 40.5795, lng: -74.1502 },
  'yonkers|NY': { lat: 40.9312, lng: -73.8988 },
  'white plains|NY': { lat: 41.0340, lng: -73.7629 },
  'new rochelle|NY': { lat: 40.9115, lng: -73.7824 },
  'mount vernon|NY': { lat: 40.9126, lng: -73.8371 },
  'buffalo|NY': { lat: 42.8864, lng: -78.8784 },
  'rochester|NY': { lat: 43.1566, lng: -77.6088 },
  'syracuse|NY': { lat: 43.0481, lng: -76.1474 },
  'albany|NY': { lat: 42.6526, lng: -73.7562 },

  // New Jersey
  'newark|NJ': { lat: 40.7357, lng: -74.1724 },
  'jersey city|NJ': { lat: 40.7178, lng: -74.0431 },
  'hoboken|NJ': { lat: 40.7440, lng: -74.0324 },
  'paterson|NJ': { lat: 40.9168, lng: -74.1718 },
  'elizabeth|NJ': { lat: 40.6640, lng: -74.2107 },
  'cherry hill|NJ': { lat: 39.9348, lng: -75.0307 },
  'camden|NJ': { lat: 39.9259, lng: -75.1196 },
  'edison|NJ': { lat: 40.5187, lng: -74.4121 },
  'trenton|NJ': { lat: 40.2171, lng: -74.7429 },

  // Connecticut
  'stamford|CT': { lat: 41.0534, lng: -73.5387 },
  'hartford|CT': { lat: 41.7658, lng: -72.6734 },
  'new haven|CT': { lat: 41.3083, lng: -72.9279 },
  'bridgeport|CT': { lat: 41.1865, lng: -73.1952 },
  'waterbury|CT': { lat: 41.5582, lng: -73.0515 },

  // Los Angeles Metro
  'los angeles|CA': { lat: 34.0522, lng: -118.2437 },
  'long beach|CA': { lat: 33.7701, lng: -118.1937 },
  'anaheim|CA': { lat: 33.8366, lng: -117.9143 },
  'santa ana|CA': { lat: 33.7455, lng: -117.8677 },
  'glendale|CA': { lat: 34.1425, lng: -118.2551 },
  'pasadena|CA': { lat: 34.1478, lng: -118.1445 },
  'torrance|CA': { lat: 33.8358, lng: -118.3406 },
  'pomona|CA': { lat: 34.0551, lng: -117.7500 },
  'burbank|CA': { lat: 34.1808, lng: -118.3090 },
  'inglewood|CA': { lat: 33.9617, lng: -118.3531 },
  'ontario|CA': { lat: 34.0633, lng: -117.6509 },
  'downey|CA': { lat: 33.9401, lng: -118.1332 },
  'fullerton|CA': { lat: 33.8704, lng: -117.9242 },
  'costa mesa|CA': { lat: 33.6412, lng: -117.9187 },

  // San Francisco Bay Area
  'san francisco|CA': { lat: 37.7749, lng: -122.4194 },
  'oakland|CA': { lat: 37.8044, lng: -122.2712 },
  'berkeley|CA': { lat: 37.8716, lng: -122.2727 },
  'fremont|CA': { lat: 37.5485, lng: -121.9886 },
  'hayward|CA': { lat: 37.6688, lng: -122.0808 },
  'san mateo|CA': { lat: 37.5630, lng: -122.3255 },
  'concord|CA': { lat: 37.9780, lng: -122.0311 },
  'walnut creek|CA': { lat: 37.9101, lng: -122.0652 },
  'santa rosa|CA': { lat: 38.4404, lng: -122.7141 },
  'vallejo|CA': { lat: 38.1041, lng: -122.2566 },

  // San Diego
  'san diego|CA': { lat: 32.7157, lng: -117.1611 },
  'chula vista|CA': { lat: 32.6401, lng: -117.0842 },
  'oceanside|CA': { lat: 33.1959, lng: -117.3795 },
  'escondido|CA': { lat: 33.1192, lng: -117.0864 },
  'carlsbad|CA': { lat: 33.1581, lng: -117.3506 },
  'el cajon|CA': { lat: 32.7948, lng: -116.9625 },

  // San Jose / Silicon Valley
  'san jose|CA': { lat: 37.3382, lng: -121.8863 },
  'santa clara|CA': { lat: 37.3541, lng: -121.9552 },
  'sunnyvale|CA': { lat: 37.3688, lng: -122.0363 },
  'mountain view|CA': { lat: 37.3861, lng: -122.0839 },
  'milpitas|CA': { lat: 37.4323, lng: -121.8996 },
  'cupertino|CA': { lat: 37.3230, lng: -122.0322 },
  'palo alto|CA': { lat: 37.4419, lng: -122.1430 },
  'santa cruz|CA': { lat: 36.9741, lng: -122.0308 },

  // Sacramento
  'sacramento|CA': { lat: 38.5816, lng: -121.4944 },
  'elk grove|CA': { lat: 38.4088, lng: -121.3716 },
  'roseville|CA': { lat: 38.7521, lng: -121.2880 },
  'folsom|CA': { lat: 38.6780, lng: -121.1761 },

  // Chicago Metro
  'chicago|IL': { lat: 41.8781, lng: -87.6298 },
  'aurora|IL': { lat: 41.7606, lng: -88.3201 },
  'naperville|IL': { lat: 41.7508, lng: -88.1535 },
  'joliet|IL': { lat: 41.5250, lng: -88.0817 },
  'elgin|IL': { lat: 42.0354, lng: -88.2826 },
  'schaumburg|IL': { lat: 42.0334, lng: -88.0834 },
  'evanston|IL': { lat: 42.0451, lng: -87.6878 },
  'arlington heights|IL': { lat: 42.0884, lng: -87.9806 },
  'tinley park|IL': { lat: 41.5731, lng: -87.7845 },
  'rosemont|IL': { lat: 41.9953, lng: -87.8845 },
  'springfield|IL': { lat: 39.7817, lng: -89.6501 },

  // Houston
  'houston|TX': { lat: 29.7604, lng: -95.3698 },
  'pasadena|TX': { lat: 29.6911, lng: -95.2091 },
  'sugar land|TX': { lat: 29.6197, lng: -95.6349 },
  'pearland|TX': { lat: 29.5636, lng: -95.2860 },
  'league city|TX': { lat: 29.5075, lng: -95.0950 },
  'baytown|TX': { lat: 29.7355, lng: -94.9774 },
  'conroe|TX': { lat: 30.3119, lng: -95.4560 },
  'spring|TX': { lat: 30.0799, lng: -95.4172 },
  'katy|TX': { lat: 29.7858, lng: -95.8245 },
  'humble|TX': { lat: 29.9988, lng: -95.2622 },
  'cypress|TX': { lat: 29.9691, lng: -95.6970 },

  // Dallas/Fort Worth
  'dallas|TX': { lat: 32.7767, lng: -96.7970 },
  'fort worth|TX': { lat: 32.7555, lng: -97.3308 },
  'arlington|TX': { lat: 32.7357, lng: -97.1081 },
  'plano|TX': { lat: 33.0198, lng: -96.6989 },
  'irving|TX': { lat: 32.8140, lng: -96.9489 },
  'garland|TX': { lat: 32.9126, lng: -96.6389 },
  'frisco|TX': { lat: 33.1507, lng: -96.8236 },
  'mckinney|TX': { lat: 33.1972, lng: -96.6397 },
  'grand prairie|TX': { lat: 32.7460, lng: -96.9978 },
  'denton|TX': { lat: 33.2148, lng: -97.1331 },
  'mesquite|TX': { lat: 32.7668, lng: -96.5992 },

  // San Antonio
  'san antonio|TX': { lat: 29.4241, lng: -98.4936 },
  'new braunfels|TX': { lat: 29.7030, lng: -98.1245 },
  'san marcos|TX': { lat: 29.8833, lng: -97.9414 },

  // Austin
  'austin|TX': { lat: 30.2672, lng: -97.7431 },
  'round rock|TX': { lat: 30.5083, lng: -97.6789 },
  'cedar park|TX': { lat: 30.5052, lng: -97.8203 },
  'georgetown|TX': { lat: 30.6333, lng: -97.6781 },
  'pflugerville|TX': { lat: 30.4394, lng: -97.6200 },

  // Phoenix
  'phoenix|AZ': { lat: 33.4484, lng: -112.0740 },
  'mesa|AZ': { lat: 33.4152, lng: -111.8315 },
  'chandler|AZ': { lat: 33.3062, lng: -111.8413 },
  'scottsdale|AZ': { lat: 33.4942, lng: -111.9261 },
  'glendale|AZ': { lat: 33.5387, lng: -112.1860 },
  'tempe|AZ': { lat: 33.4255, lng: -111.9400 },
  'gilbert|AZ': { lat: 33.3528, lng: -111.7890 },
  'tucson|AZ': { lat: 32.2226, lng: -110.9747 },

  // Philadelphia
  'philadelphia|PA': { lat: 39.9526, lng: -75.1652 },
  'king of prussia|PA': { lat: 40.0892, lng: -75.3963 },
  'bensalem|PA': { lat: 40.1046, lng: -74.9510 },
  'oaks|PA': { lat: 40.1312, lng: -75.4590 },
  'pittsburgh|PA': { lat: 40.4406, lng: -79.9959 },
  'monroeville|PA': { lat: 40.4213, lng: -79.7881 },
  'harrisburg|PA': { lat: 40.2732, lng: -76.8867 },

  // Wilmington DE
  'wilmington|DE': { lat: 39.7391, lng: -75.5398 },
  'dover|DE': { lat: 39.1582, lng: -75.5244 },

  // Miami / South Florida
  'miami|FL': { lat: 25.7617, lng: -80.1918 },
  'fort lauderdale|FL': { lat: 26.1224, lng: -80.1373 },
  'hollywood|FL': { lat: 26.0112, lng: -80.1495 },
  'hialeah|FL': { lat: 25.8576, lng: -80.2781 },
  'pembroke pines|FL': { lat: 26.0031, lng: -80.2241 },
  'coral springs|FL': { lat: 26.2712, lng: -80.2706 },
  'boca raton|FL': { lat: 26.3683, lng: -80.1289 },
  'pompano beach|FL': { lat: 26.2379, lng: -80.1248 },

  // Tampa Bay
  'tampa|FL': { lat: 27.9506, lng: -82.4572 },
  'st. petersburg|FL': { lat: 27.7676, lng: -82.6403 },
  'clearwater|FL': { lat: 27.9659, lng: -82.8001 },
  'lakeland|FL': { lat: 28.0395, lng: -81.9498 },
  'brandon|FL': { lat: 27.9378, lng: -82.2859 },
  'bradenton|FL': { lat: 27.4989, lng: -82.5748 },
  'sarasota|FL': { lat: 27.3364, lng: -82.5307 },

  // Orlando
  'orlando|FL': { lat: 28.5383, lng: -81.3792 },
  'kissimmee|FL': { lat: 28.2920, lng: -81.4076 },
  'sanford|FL': { lat: 28.8003, lng: -81.2698 },
  'daytona beach|FL': { lat: 29.2108, lng: -81.0228 },

  // Jacksonville
  'jacksonville|FL': { lat: 30.3322, lng: -81.6557 },
  'st. augustine|FL': { lat: 29.8918, lng: -81.3145 },

  // Atlanta
  'atlanta|GA': { lat: 33.7490, lng: -84.3880 },
  'sandy springs|GA': { lat: 33.9304, lng: -84.3733 },
  'roswell|GA': { lat: 34.0232, lng: -84.3616 },
  'marietta|GA': { lat: 33.9526, lng: -84.5499 },
  'alpharetta|GA': { lat: 34.0754, lng: -84.2941 },
  'kennesaw|GA': { lat: 34.0234, lng: -84.6155 },
  'decatur|GA': { lat: 33.7748, lng: -84.2963 },
  'savannah|GA': { lat: 32.0809, lng: -81.0912 },

  // Boston
  'boston|MA': { lat: 42.3601, lng: -71.0589 },
  'cambridge|MA': { lat: 42.3736, lng: -71.1097 },
  'quincy|MA': { lat: 42.2529, lng: -71.0023 },
  'worcester|MA': { lat: 42.2626, lng: -71.8023 },
  'lowell|MA': { lat: 42.6334, lng: -71.3162 },
  'framingham|MA': { lat: 42.2793, lng: -71.4162 },
  'marlborough|MA': { lat: 42.3459, lng: -71.5523 },
  'springfield|MA': { lat: 42.1015, lng: -72.5898 },

  // Seattle
  'seattle|WA': { lat: 47.6062, lng: -122.3321 },
  'tacoma|WA': { lat: 47.2529, lng: -122.4443 },
  'bellevue|WA': { lat: 47.6101, lng: -122.2015 },
  'kent|WA': { lat: 47.3809, lng: -122.2348 },
  'everett|WA': { lat: 47.9790, lng: -122.2021 },
  'renton|WA': { lat: 47.4829, lng: -122.2171 },
  'redmond|WA': { lat: 47.6740, lng: -122.1215 },
  'spokane|WA': { lat: 47.6588, lng: -117.4260 },
  'vancouver|WA': { lat: 45.6387, lng: -122.6615 },

  // Denver
  'denver|CO': { lat: 39.7392, lng: -104.9903 },
  'aurora|CO': { lat: 39.7294, lng: -104.8319 },
  'lakewood|CO': { lat: 39.7047, lng: -105.0814 },
  'boulder|CO': { lat: 40.0150, lng: -105.2705 },
  'colorado springs|CO': { lat: 38.8339, lng: -104.8214 },
  'fort collins|CO': { lat: 40.5853, lng: -105.0844 },

  // Detroit
  'detroit|MI': { lat: 42.3314, lng: -83.0458 },
  'warren|MI': { lat: 42.4775, lng: -83.0277 },
  'sterling heights|MI': { lat: 42.5803, lng: -83.0302 },
  'ann arbor|MI': { lat: 42.2808, lng: -83.7430 },
  'dearborn|MI': { lat: 42.3223, lng: -83.1763 },
  'grand rapids|MI': { lat: 42.9634, lng: -85.6681 },
  'lansing|MI': { lat: 42.7325, lng: -84.5555 },

  // Minneapolis/St. Paul
  'minneapolis|MN': { lat: 44.9778, lng: -93.2650 },
  'st. paul|MN': { lat: 44.9537, lng: -93.0900 },
  'bloomington|MN': { lat: 44.8408, lng: -93.2983 },
  'brooklyn park|MN': { lat: 45.0941, lng: -93.3563 },
  'plymouth|MN': { lat: 45.0105, lng: -93.4555 },
  'duluth|MN': { lat: 46.7867, lng: -92.1005 },

  // Las Vegas
  'las vegas|NV': { lat: 36.1699, lng: -115.1398 },
  'henderson|NV': { lat: 36.0395, lng: -114.9817 },
  'north las vegas|NV': { lat: 36.1989, lng: -115.1175 },
  'reno|NV': { lat: 39.5296, lng: -119.8138 },

  // Portland
  'portland|OR': { lat: 45.5152, lng: -122.6784 },
  'beaverton|OR': { lat: 45.4871, lng: -122.8038 },
  'hillsboro|OR': { lat: 45.5229, lng: -122.9898 },
  'gresham|OR': { lat: 45.4998, lng: -122.4316 },
  'eugene|OR': { lat: 44.0521, lng: -123.0868 },
  'salem|OR': { lat: 44.9429, lng: -123.0351 },

  // Cleveland / Ohio
  'cleveland|OH': { lat: 41.4993, lng: -81.6944 },
  'akron|OH': { lat: 41.0814, lng: -81.5190 },
  'canton|OH': { lat: 40.7990, lng: -81.3784 },
  'columbus|OH': { lat: 39.9612, lng: -82.9988 },
  'dublin|OH': { lat: 40.0992, lng: -83.1141 },
  'cincinnati|OH': { lat: 39.1031, lng: -84.5120 },
  'toledo|OH': { lat: 41.6528, lng: -83.5379 },
  'dayton|OH': { lat: 39.7589, lng: -84.1916 },

  // Indianapolis
  'indianapolis|IN': { lat: 39.7684, lng: -86.1581 },
  'carmel|IN': { lat: 39.9784, lng: -86.1180 },
  'fishers|IN': { lat: 39.9568, lng: -86.0131 },
  'fort wayne|IN': { lat: 41.0793, lng: -85.1394 },
  'gary|IN': { lat: 41.5934, lng: -87.3464 },
  'evansville|IN': { lat: 37.9716, lng: -87.5711 },

  // Charlotte
  'charlotte|NC': { lat: 35.2271, lng: -80.8431 },
  'concord|NC': { lat: 35.4088, lng: -80.5795 },
  'raleigh|NC': { lat: 35.7796, lng: -78.6382 },
  'durham|NC': { lat: 35.9940, lng: -78.8986 },
  'chapel hill|NC': { lat: 35.9132, lng: -79.0558 },
  'greensboro|NC': { lat: 36.0726, lng: -79.7920 },
  'winston-salem|NC': { lat: 36.0999, lng: -80.2442 },
  'fayetteville|NC': { lat: 35.0527, lng: -78.8784 },
  'wilmington|NC': { lat: 34.2257, lng: -77.9447 },

  // Nashville
  'nashville|TN': { lat: 36.1627, lng: -86.7816 },
  'murfreesboro|TN': { lat: 35.8456, lng: -86.3903 },
  'franklin|TN': { lat: 35.9251, lng: -86.8689 },
  'knoxville|TN': { lat: 35.9606, lng: -83.9207 },
  'memphis|TN': { lat: 35.1495, lng: -90.0490 },
  'chattanooga|TN': { lat: 35.0456, lng: -85.3097 },

  // Kansas City
  'kansas city|MO': { lat: 39.0997, lng: -94.5786 },
  'st. louis|MO': { lat: 38.6270, lng: -90.1994 },
  'springfield|MO': { lat: 37.2090, lng: -93.2923 },
  'columbia|MO': { lat: 38.9517, lng: -92.3341 },
  'independence|MO': { lat: 39.0911, lng: -94.4155 },
  'overland park|KS': { lat: 38.9822, lng: -94.6708 },
  'olathe|KS': { lat: 38.8814, lng: -94.8191 },
  'wichita|KS': { lat: 37.6872, lng: -97.3301 },
  'topeka|KS': { lat: 39.0473, lng: -95.6752 },

  // Salt Lake City
  'salt lake city|UT': { lat: 40.7608, lng: -111.8910 },
  'west valley city|UT': { lat: 40.6916, lng: -112.0011 },
  'provo|UT': { lat: 40.2338, lng: -111.6585 },
  'ogden|UT': { lat: 41.2230, lng: -111.9738 },
  'st. george|UT': { lat: 37.0965, lng: -113.5684 },

  // Baltimore / Maryland
  'baltimore|MD': { lat: 39.2904, lng: -76.6122 },
  'columbia|MD': { lat: 39.2037, lng: -76.8610 },
  'annapolis|MD': { lat: 38.9784, lng: -76.4922 },
  'frederick|MD': { lat: 39.4143, lng: -77.4105 },

  // Virginia
  'richmond|VA': { lat: 37.5407, lng: -77.4360 },
  'virginia beach|VA': { lat: 36.8529, lng: -75.9780 },
  'norfolk|VA': { lat: 36.8508, lng: -76.2859 },
  'arlington|VA': { lat: 38.8816, lng: -77.0910 },
  'alexandria|VA': { lat: 38.8048, lng: -77.0469 },
  'roanoke|VA': { lat: 37.2710, lng: -79.9414 },

  // Washington DC
  'washington|DC': { lat: 38.9072, lng: -77.0369 },

  // New Orleans / Louisiana
  'new orleans|LA': { lat: 29.9511, lng: -90.0715 },
  'baton rouge|LA': { lat: 30.4515, lng: -91.1871 },
  'metairie|LA': { lat: 29.9841, lng: -90.1528 },
  'shreveport|LA': { lat: 32.5252, lng: -93.7502 },

  // Louisville / Kentucky
  'louisville|KY': { lat: 38.2527, lng: -85.7585 },
  'lexington|KY': { lat: 38.0406, lng: -84.5037 },
  'covington|KY': { lat: 39.0837, lng: -84.5086 },
  'florence|KY': { lat: 38.9990, lng: -84.6266 },

  // Oklahoma
  'oklahoma city|OK': { lat: 35.4676, lng: -97.5164 },
  'tulsa|OK': { lat: 36.1540, lng: -95.9928 },
  'norman|OK': { lat: 35.2226, lng: -97.4395 },
  'edmond|OK': { lat: 35.6528, lng: -97.4781 },

  // Milwaukee / Wisconsin
  'milwaukee|WI': { lat: 43.0389, lng: -87.9065 },
  'madison|WI': { lat: 43.0731, lng: -89.4012 },
  'green bay|WI': { lat: 44.5133, lng: -88.0133 },
  'kenosha|WI': { lat: 42.5847, lng: -87.8212 },
  'racine|WI': { lat: 42.7261, lng: -87.7829 },

  // Alabama
  'birmingham|AL': { lat: 33.5186, lng: -86.8104 },
  'huntsville|AL': { lat: 34.7304, lng: -86.5861 },
  'montgomery|AL': { lat: 32.3668, lng: -86.3000 },
  'mobile|AL': { lat: 30.6954, lng: -88.0399 },
  'tuscaloosa|AL': { lat: 33.2098, lng: -87.5692 },

  // New Mexico
  'albuquerque|NM': { lat: 35.0844, lng: -106.6504 },
  'santa fe|NM': { lat: 35.6870, lng: -105.9378 },
  'las cruces|NM': { lat: 32.3199, lng: -106.7637 },

  // Mississippi
  'jackson|MS': { lat: 32.2988, lng: -90.1848 },
  'southaven|MS': { lat: 34.9919, lng: -90.0126 },
  'gulfport|MS': { lat: 30.3674, lng: -89.0928 },
  'biloxi|MS': { lat: 30.3960, lng: -88.8853 },

  // Arkansas
  'little rock|AR': { lat: 34.7465, lng: -92.2896 },
  'west memphis|AR': { lat: 35.1465, lng: -90.1846 },
  'fayetteville|AR': { lat: 36.0626, lng: -94.1574 },

  // Iowa
  'des moines|IA': { lat: 41.5868, lng: -93.6250 },
  'cedar rapids|IA': { lat: 41.9779, lng: -91.6656 },
  'davenport|IA': { lat: 41.5236, lng: -90.5776 },

  // Nebraska
  'omaha|NE': { lat: 41.2565, lng: -95.9345 },
  'lincoln|NE': { lat: 40.8136, lng: -96.7026 },

  // Hawaii
  'honolulu|HI': { lat: 21.3069, lng: -157.8583 },

  // Alaska
  'anchorage|AK': { lat: 61.2181, lng: -149.9003 },

  // Idaho
  'boise|ID': { lat: 43.6150, lng: -116.2023 },

  // Montana
  'billings|MT': { lat: 45.7833, lng: -108.5007 },
  'missoula|MT': { lat: 46.8721, lng: -113.9940 },

  // North Dakota
  'fargo|ND': { lat: 46.8772, lng: -96.7898 },
  'bismarck|ND': { lat: 46.8083, lng: -100.7837 },

  // South Dakota
  'sioux falls|SD': { lat: 43.5446, lng: -96.7311 },

  // Wyoming
  'cheyenne|WY': { lat: 41.1400, lng: -104.8202 },

  // Vermont
  'burlington|VT': { lat: 44.4759, lng: -73.2121 },

  // New Hampshire
  'nashua|NH': { lat: 42.7654, lng: -71.4676 },
  'manchester|NH': { lat: 42.9956, lng: -71.4548 },
  'concord|NH': { lat: 43.2081, lng: -71.5376 },

  // Maine
  'portland|ME': { lat: 43.6591, lng: -70.2568 },
  'bangor|ME': { lat: 44.8016, lng: -68.7712 },

  // Rhode Island
  'providence|RI': { lat: 41.8240, lng: -71.4128 },
  'warwick|RI': { lat: 41.7001, lng: -71.4162 },
  'cranston|RI': { lat: 41.7798, lng: -71.4373 },

  // South Carolina
  'charleston|SC': { lat: 32.7765, lng: -79.9311 },
  'columbia|SC': { lat: 34.0007, lng: -81.0348 },
  'rock hill|SC': { lat: 34.9249, lng: -81.0251 },
  'greenville|SC': { lat: 34.8526, lng: -82.3940 },
  'myrtle beach|SC': { lat: 33.6891, lng: -78.8867 },
  'fort mill|SC': { lat: 35.0074, lng: -80.9451 },

  // West Virginia
  'charleston|WV': { lat: 38.3498, lng: -81.6326 },
  'huntington|WV': { lat: 38.4192, lng: -82.4452 },

  // Additional state capitals & common cities
  'tallahassee|FL': { lat: 30.4383, lng: -84.2807 },
  'el paso|TX': { lat: 31.7619, lng: -106.4850 },
  'corpus christi|TX': { lat: 27.8006, lng: -97.3964 },
  'lubbock|TX': { lat: 33.5779, lng: -101.8552 },
  'laredo|TX': { lat: 27.5036, lng: -99.5076 },
  'amarillo|TX': { lat: 35.2220, lng: -101.8313 },
  'bakersfield|CA': { lat: 35.3733, lng: -119.0187 },
  'fresno|CA': { lat: 36.7378, lng: -119.7871 },
  'stockton|CA': { lat: 37.9577, lng: -121.2908 },
  'riverside|CA': { lat: 33.9806, lng: -117.3755 },
  'modesto|CA': { lat: 37.6391, lng: -120.9969 },
  'irvine|CA': { lat: 33.6846, lng: -117.8265 },
};

/**
 * Look up coordinates for a city/state combination.
 * Returns null if the city isn't in our lookup table.
 */
export function getCityCoordinates(city: string, state: string): { lat: number; lng: number } | null {
  const key = `${city.toLowerCase().trim()}|${state.toUpperCase().trim()}`;
  return CITY_COORDS[key] || null;
}

/**
 * Small ZIP code prefix → approximate coordinates lookup.
 * Covers the first 3 digits of US ZIP codes for fallback geolocation.
 */
const ZIP_PREFIX_COORDS: Record<string, { lat: number; lng: number }> = {
  '100': { lat: 40.71, lng: -74.01 },  // New York
  '101': { lat: 40.71, lng: -74.01 },
  '102': { lat: 40.71, lng: -74.01 },
  '103': { lat: 40.58, lng: -74.15 },  // Staten Island
  '104': { lat: 40.84, lng: -73.86 },  // Bronx
  '110': { lat: 40.73, lng: -73.79 },  // Queens
  '112': { lat: 40.68, lng: -73.94 },  // Brooklyn
  '070': { lat: 40.74, lng: -74.17 },  // Newark NJ
  '080': { lat: 39.93, lng: -75.03 },  // Cherry Hill NJ
  '191': { lat: 39.95, lng: -75.17 },  // Philadelphia
  '200': { lat: 38.91, lng: -77.04 },  // DC
  '210': { lat: 39.29, lng: -76.61 },  // Baltimore
  '300': { lat: 33.75, lng: -84.39 },  // Atlanta
  '330': { lat: 25.76, lng: -80.19 },  // Miami
  '336': { lat: 27.95, lng: -82.46 },  // Tampa
  '328': { lat: 28.54, lng: -81.38 },  // Orlando
  '322': { lat: 30.33, lng: -81.66 },  // Jacksonville
  '370': { lat: 36.16, lng: -86.78 },  // Nashville
  '381': { lat: 35.15, lng: -90.05 },  // Memphis
  '400': { lat: 38.25, lng: -85.76 },  // Louisville
  '430': { lat: 39.96, lng: -83.00 },  // Columbus OH
  '441': { lat: 41.50, lng: -81.69 },  // Cleveland
  '452': { lat: 39.10, lng: -84.51 },  // Cincinnati
  '460': { lat: 39.77, lng: -86.16 },  // Indianapolis
  '480': { lat: 42.33, lng: -83.05 },  // Detroit
  '532': { lat: 43.04, lng: -87.91 },  // Milwaukee
  '554': { lat: 44.98, lng: -93.27 },  // Minneapolis
  '600': { lat: 41.88, lng: -87.63 },  // Chicago
  '630': { lat: 38.63, lng: -90.20 },  // St. Louis
  '640': { lat: 39.10, lng: -94.58 },  // Kansas City
  '680': { lat: 41.26, lng: -95.93 },  // Omaha
  '700': { lat: 29.95, lng: -90.07 },  // New Orleans
  '730': { lat: 35.47, lng: -97.52 },  // Oklahoma City
  '750': { lat: 32.78, lng: -96.80 },  // Dallas
  '770': { lat: 29.76, lng: -95.37 },  // Houston
  '782': { lat: 29.42, lng: -98.49 },  // San Antonio
  '787': { lat: 30.27, lng: -97.74 },  // Austin
  '800': { lat: 39.74, lng: -104.99 },  // Denver
  '841': { lat: 40.76, lng: -111.89 },  // Salt Lake City
  '850': { lat: 33.45, lng: -112.07 },  // Phoenix
  '857': { lat: 32.22, lng: -110.97 },  // Tucson
  '871': { lat: 35.08, lng: -106.65 },  // Albuquerque
  '891': { lat: 36.17, lng: -115.14 },  // Las Vegas
  '900': { lat: 34.05, lng: -118.24 },  // Los Angeles
  '920': { lat: 32.72, lng: -117.16 },  // San Diego
  '941': { lat: 37.77, lng: -122.42 },  // San Francisco
  '950': { lat: 37.34, lng: -121.89 },  // San Jose
  '958': { lat: 38.58, lng: -121.49 },  // Sacramento
  '972': { lat: 45.52, lng: -122.68 },  // Portland
  '981': { lat: 47.61, lng: -122.33 },  // Seattle
};

/**
 * Convert a US ZIP code to approximate coordinates using prefix lookup.
 */
export function getZipCoordinates(zip: string): { lat: number; lng: number } | null {
  const cleaned = zip.replace(/\D/g, '').slice(0, 5);
  if (cleaned.length < 3) return null;

  // Try 3-digit prefix
  const prefix3 = cleaned.slice(0, 3);
  if (ZIP_PREFIX_COORDS[prefix3]) return ZIP_PREFIX_COORDS[prefix3];

  // Try broader region (first 2 digits → nearest known prefix)
  const prefix2 = cleaned.slice(0, 2);
  for (const [key, coords] of Object.entries(ZIP_PREFIX_COORDS)) {
    if (key.startsWith(prefix2)) return coords;
  }

  return null;
}
