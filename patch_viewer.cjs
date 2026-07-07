const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

const oldViewer = `{viewingDoc.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                  {(() => {
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
                  })()}
                </div>
              ) : getEmbedUrl(viewingDoc) ? (`;

const newViewer = `{viewingDoc.type === 'video' || viewingDoc.type === 'audio' ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800 p-8">
                  {(() => {
                    if (viewingDoc.type === 'audio') {
                      const driveFileMeta = getGoogleFileId(viewingDoc.url || '');
                      if (driveFileMeta.id && driveFileMeta.type === 'file') {
                        return (
                          <iframe 
                            src={\`https://drive.google.com/file/d/\${driveFileMeta.id}/preview\`}
                            title={viewingDoc.title}
                            className="w-full h-64 border-0 rounded-xl"
                            allowFullScreen
                          />
                        );
                      }
                      return (
                        <div className="bg-slate-800 p-12 rounded-3xl flex flex-col items-center gap-8 w-full max-w-md shadow-2xl border border-slate-700">
                          <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center">
                             <Music className="w-12 h-12 text-indigo-400 animate-pulse" />
                          </div>
                          <div className="text-center w-full">
                            <h3 className="text-white font-bold text-xl mb-2 truncate max-w-full px-4">{viewingDoc.title}</h3>
                            <p className="text-slate-400 text-sm mb-6">Trình phát âm thanh</p>
                            <audio 
                              src={viewingDoc.url}
                              controls 
                              className="w-full"
                            />
                          </div>
                        </div>
                      );
                    }
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
                  })()}
                </div>
              ) : getEmbedUrl(viewingDoc) ? (`;

if (code.includes(oldViewer)) {
  code = code.replace(oldViewer, newViewer);
  fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
  console.log("Viewer Patched");
} else {
  console.log("Could not patch viewer");
}
