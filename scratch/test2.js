fetch('https://public-api.wordpress.com/wp/v2/sites/dhadhankun.wordpress.com/posts?search=last-ch-number&per_page=5').then(r=>r.json()).then(posts => posts.forEach(p => { 
  const regex = /class=["'][^"']*?\blast-ch-number\b[^"']*?["'][^>]*>([\s\S]*?)<\//i;
  const m = p.content.rendered.match(regex);
  const regexFallback = /class=["'][^"']*?\blast-ch\b[^"']*?["'][^>]*>([\s\S]*?)<\//i;
  const mFallback = p.content.rendered.match(regexFallback);
  console.log("ID:", p.id, "| last-ch-number:", m ? m[1] : null, "| last-ch:", mFallback ? mFallback[1] : null); 
}))
