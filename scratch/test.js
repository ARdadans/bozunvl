const html = `<p class="last-ch"><span>Last Chapter:</span><span class="last-ch-number">2.5</span></p>`;
const regex1 = /class=["'][^"']*?\blast-ch-number\b[^"']*?["'][^>]*>([\s\S]*?)<\//i;
const match = html.match(regex1);
console.log("Regex1:", match ? match[1] : null);
