// Apply a saved or shared concept before the first paint.
(()=>{const themes=['charcoal','navy','ruby'];let theme='charcoal';try{const requested=new URLSearchParams(location.search).get('theme');const saved=localStorage.getItem('geo-theme');theme=themes.includes(requested)?requested:themes.includes(saved)?saved:theme}catch{}document.documentElement.dataset.theme=theme})();
