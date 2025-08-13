 #!/bin/bash
 
deno compile --allow-net --allow-read --target x86_64-unknown-linux-gnu index.ts
chmod +x deno-api-proxy