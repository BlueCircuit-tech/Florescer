/** Reduz uma imagem para armazenamento local como JPEG. */
export function compressPhoto(file) {
  if (!file?.type.startsWith('image/')) return Promise.reject(new Error('Escolha um arquivo de imagem.'));
  if (file.size > 12 * 1024 * 1024) return Promise.reject(new Error('A foto deve ter no máximo 12 MB.'));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler esta foto.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Esta imagem não pôde ser aberta.'));
      img.onload = () => {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        let canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        let data = canvas.toDataURL('image/jpeg', .76);
        while (data.length > 450000 && canvas.width > 640 && canvas.height > 640) {
          const smaller = document.createElement('canvas');
          smaller.width = Math.round(canvas.width * .8);
          smaller.height = Math.round(canvas.height * .8);
          smaller.getContext('2d').drawImage(canvas, 0, 0, smaller.width, smaller.height);
          canvas = smaller;
          data = canvas.toDataURL('image/jpeg', .66);
        }
        if (data.length > 500000) reject(new Error('A foto ficou grande demais para o armazenamento do app.'));
        else resolve(data);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
