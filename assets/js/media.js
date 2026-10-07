/**
 * Recorta e reduz uma foto de perfil para um quadrado de 256px.
 *
 * O avatar é mostrado em 40–78px, então guardar o mesmo JPEG de 1280px das
 * fotos do diário desperdiça o armazenamento local — que é pequeno e já é
 * disputado com as fotos da barriga. O recorte é central, que é onde o rosto
 * costuma estar.
 */
export function compressAvatar(file, lado = 256) {
  if (!file?.type.startsWith('image/')) return Promise.reject(new Error('Escolha um arquivo de imagem.'));
  if (file.size > 12 * 1024 * 1024) return Promise.reject(new Error('A foto deve ter no máximo 12 MB.'));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler esta foto.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Esta imagem não pôde ser aberta.'));
      img.onload = () => {
        const corte = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = lado;
        canvas.height = lado;
        canvas.getContext('2d').drawImage(
          img,
          (img.width - corte) / 2, (img.height - corte) / 2, corte, corte,
          0, 0, lado, lado,
        );
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

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
