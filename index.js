const readFile = (file) => {
  const reader = new window.FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = () => reject(new Error('error'));

    if (/^image/.test(file.type)) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
};

const newImage = (file) => {
  const image = new Image();
  image.src = file;

  return { image, file };
};

const loadImage = ({ image, file }) => new Promise((resolve, reject) => {
  image.onload = () => { // eslint-disable-line no-param-reassign
    resolve({
      height: image.height,
      width: image.width,
      image: file,
    });
  };
  image.onerror = () => reject(new Error('error')); // eslint-disable-line no-param-reassign
});

const renderImage = (pdf, data) => {
  const height = data.height / (data.width / 210);
  for (let k = 0; k < (height / 297); k += 1) {
    if (k > 0) {
      pdf.addPage();
      pdf.addImage(data.image, data.type.split('').pop(), 0, -(k * 297), 210, height);
    } else {
      pdf.addImage(data.image, data.type.split('').pop(), 0, 0, 210, height);
    }
  }
};

window.onload = () => {
  document.querySelector('#test').addEventListener('change', () => { 
    const pdf = jsPDF();
    Promise.all([ ...document.querySelector('#test').files].map(image => readFile(image)))
      .then(response => Promise.all(response.map(val => loadImage(newImage(val)))))
      .then((res) => {
        res.forEach((img, j) => {
          if (j > 0) {
            pdf.addPage();
            renderImage(pdf, { height: img.height, width: img.width, image: img.image, type: [ ...document.querySelector('#test').files][j].type });
          } else {
            renderImage(pdf, { height: img.height, width: img.width, image: img.image, type: [ ...document.querySelector('#test').files][j].type });
          }
        });

        console.log(pdf.output('blob'))
        const test = pdf.output('blob');


        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json; charset=utf-8");

        fetch('/file', { 
          method: 'POST',
          body: JSON.stringify({file: pdf.output('datauri')}),
          headers: myHeaders
        })
        // console.log(pdf.output('datauri'))
        // pdf.save('two-by-four.pdf')

      });
  })
}