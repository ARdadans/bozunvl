const post = {
  "content": {
    "rendered": "\u003Cp\u003E    \u003Cspan class=\"summary\"\u003EA dummy summary for Death Note. A man dies and is reincarnated in another world. They embark on an adventure together, growing stronger through battles, magic, and skill evolution while uncovering the mysteries of their new world.\u003C/span\u003E\u003C/p\u003E\n\u003Cul class=\"title-alts\"\u003E\n\u003Cli class=\"native-title\"\u003EDeath Note Alt 1\u003C/li\u003E\n\u003Cli\u003EDeath Note Alt 2\u003C/li\u003E\n\u003C/ul\u003E\n\u003Cul class=\"genres\"\u003E\n\u003Cli\u003EAdventure\u003C/li\u003E\n\u003Cli\u003ELevel Up\u003C/li\u003E\n\u003Cli\u003EComedy\u003C/li\u003E\n\u003Cli\u003ESci-Fi\u003C/li\u003E\n\u003Cli\u003EMagic Power\u003C/li\u003E\n\u003Cli\u003EFantasy\u003C/li\u003E\n\u003Cli\u003EFantasy World\u003C/li\u003E\n\u003Cli\u003EReincarnation\u003C/li\u003E\n\u003C/ul\u003E\n\u003Cul class=\"tag\"\u003E\n\u003Cli\u003ENecromancer\u003C/li\u003E\n\u003Cli\u003EOverpowered MC\u003C/li\u003E\n\u003Cli\u003EHunter\u003C/li\u003E\n\u003Cli\u003ERegression\u003C/li\u003E\n\u003Cli\u003EDungeon Raid\u003C/li\u003E\n\u003Cli\u003ELeveling System\u003C/li\u003E\n\u003Cli\u003EStrong to Strongest\u003C/li\u003E\n\u003C/ul\u003E\n\u003Cp\u003E\u003Cspan class=\"media\"\u003ENovel\u003C/span\u003E\u003Cspan class=\"author\"\u003EChugong\u003C/span\u003E\u003Cspan class=\"artist\"\u003EUnknown Artist\u003C/span\u003E\u003Cspan class=\"publisher\"\u003E\u003Ca href=\"http://localhost:3000/series/372-death-note\"\u003EQidian\u003C/a\u003E\u003C/span\u003E\u003Cspan class=\"country\"\u003EJapan\u003C/span\u003E\u003Cspan class=\"language\"\u003EEnglish\u003C/span\u003E\u003Cspan class=\"status\"\u003EOngoing\u003C/span\u003E\u003Cspan class=\"year\"\u003E2017\u003C/span\u003E\u003Cspan class=\"badge\"\u003EFeatured\u003C/span\u003E\u003C/p\u003E\n\u003Cp class=\"last-ch\"\u003E\u003Cspan\u003ELast Chapter:\u003C/span\u003E\u003Cspan class=\"last-ch-number\"\u003E2.5\u003C/span\u003E\u003C/p\u003E\n\u003Cp\u003E\u003Cimg loading=\"lazy\" class=\"poster\" src=\"https://static.comix.to/55b6/i/d/c6/68e0cdf505e8a@280.jpg\" alt=\"Death Note\" title=\"Cover Fullmetal Alchemist\" width=\"300\" height=\"450\"\u003E\u003C/p\u003E\n\u003Cpre id=\"series-meta\" hidden\u003E{\"baseUrl\":\"https://example.com/chapter-\",\"chapters\":[[375,3,\"Death Note Ch. 3\",\"3\",\"2026-07-23\",2],[374,2,\"Death Note Ch. 2 First Blood\",\"2\",\"2026-07-24\",2],[373,1,\"Death Note Ch. 1 The Final Stand\",\"1\",\"2026-07-25\",1]],\"note\":{\"baseUrl\":\"Base URL yang akan digabung dengan slug.\",\"chapters\":[\"[0] postId\",\"[1] chapterNumber\",\"[2] chapterTitle\",\"[3] slug\",\"[4] createdAt (YYYY-MM-DD)\",\"[5] volume (optional)\"]}}\u003C/pre\u003E\n"
  }
};

const htmlContent = post.content.rendered;
console.log("String preview:", htmlContent.substring(0, 50));

let lastCh = 1;
const lastChNumMatch = htmlContent.match(/<[^>]*\bclass=["'][^"']*?\blast-ch-number\b[^"']*?["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/i);
console.log("Regex Match Result:", lastChNumMatch ? lastChNumMatch[1] : "No match");

if (lastChNumMatch && lastChNumMatch[1]) {
  const rawContent = lastChNumMatch[1].replace(/<[^>]+>/g, '').trim();
  console.log("Raw Content:", rawContent);
  const numMatch = rawContent.match(/[\d.]+/);
  console.log("Number Match:", numMatch ? numMatch[0] : "No match");
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    if (!isNaN(num)) {
      lastCh = num;
    }
  }
}

console.log("Final Last Ch:", lastCh);
