
---

<comment>
    <div id="waline"></div>
    <link
        rel="stylesheet"
        href="https://unpkg.com/@waline/client@v3/dist/waline.css"
    />
    <script type="module">
        import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';
        init({
            el: '#waline',
            dark: 'html[saved-theme=\'dark\']',
            serverURL: 'https://waline-blog.observerkei.top',
        });
    </script>
</comment>
