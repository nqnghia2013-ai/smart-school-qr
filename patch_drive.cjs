const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

const oldEmbedUrl = `  const getEmbedUrl = (doc: Document) => {
    if (!doc.url) return '';
    const fileIdMeta = getGoogleFileId(doc.url);
    if (fileIdMeta.id) {
      if (fileIdMeta.type === 'forms') {
        return \`https://docs.google.com/forms/d/\${fileIdMeta.id}/viewform?embedded=true\`;
      } else {
        return \`https://docs.google.com/\${fileIdMeta.type}/d/\${fileIdMeta.id}/preview\`;
      }
    }
    return doc.url;
  };`;

const newEmbedUrl = `  const getEmbedUrl = (doc: Document) => {
    if (!doc.url) return '';
    const fileIdMeta = getGoogleFileId(doc.url);
    if (fileIdMeta.id) {
      if (fileIdMeta.type === 'forms') {
        return \`https://docs.google.com/forms/d/\${fileIdMeta.id}/viewform?embedded=true\`;
      } else if (fileIdMeta.type === 'file') {
        return \`https://drive.google.com/file/d/\${fileIdMeta.id}/preview\`;
      } else {
        return \`https://docs.google.com/\${fileIdMeta.type}/d/\${fileIdMeta.id}/preview\`;
      }
    }
    return doc.url;
  };`;

code = code.replace(oldEmbedUrl, newEmbedUrl);

const oldVideoLogic = `                  {(() => {
                    const ytMatch = viewingDoc.url?.match(/(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})/);
                    const ytId = ytMatch ? ytMatch[1] : null;
                    if (ytId) {
                      return (
                        <iframe 
                          src={\`https://www.youtube.com/embed/\${ytId}?autoplay=1\`} 
                          title={viewingDoc.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <video 
                        src={viewingDoc.url}
                        controls 
                        className="max-w-full max-h-full"
                        width="100%"
                        height="100%"
                      />
                    );
                  })()}`;

const newVideoLogic = `                  {(() => {
                    const ytMatch = viewingDoc.url?.match(/(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})/);
                    const ytId = ytMatch ? ytMatch[1] : null;
                    const driveFileMeta = getGoogleFileId(viewingDoc.url || '');
                    if (ytId) {
                      return (
                        <iframe 
                          src={\`https://www.youtube.com/embed/\${ytId}?autoplay=1\`} 
                          title={viewingDoc.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    if (driveFileMeta.id && driveFileMeta.type === 'file') {
                      return (
                        <iframe 
                          src={\`https://drive.google.com/file/d/\${driveFileMeta.id}/preview\`}
                          title={viewingDoc.title}
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <video 
                        src={viewingDoc.url}
                        controls 
                        className="max-w-full max-h-full"
                        width="100%"
                        height="100%"
                      />
                    );
                  })()}`;

code = code.replace(oldVideoLogic, newVideoLogic);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
