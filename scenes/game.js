export default class BrickBouncer extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.controles = this.input.keyboard.createCursorKeys();
    this.teclasExtra = this.input.keyboard.addKeys({
      "D": Phaser.Input.Keyboard.KeyCodes.D,
      "A": Phaser.Input.Keyboard.KeyCodes.A
    });

    this.inerciaBola = 0;
    this.velocidadRaqueta = 900;
    this.velocidadPelota = 900;
    this.pelotaEnEspera = true;

    this.physics.world.drawDebug = false;
    this.margenObstaculoX = 200;
  }

  create() {
    this.instrucciones = this.add.text(this.cameras.main.centerX, 1030, "Usar flechas o A/D para moverte y Espacio para lanzar", {
      fontSize: "50px",
      fill: "#fff",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Pelota roja
    this.pelota = this.add.circle(600, 500, 35, 0xff0000).setStrokeStyle(5, 0xffffff);

    // Raqueta negra
    this.raqueta = this.add.rectangle(this.cameras.main.centerX, 950, 300, 50, 0x000000).setStrokeStyle(5, 0xffffff);

    [this.pelota, this.raqueta].forEach(obj => this.physics.add.existing(obj));

    this.physics.world.setBoundsCollision(true, true, true, false);

    this.pelota.body
      .setBounce(1, 1)
      .setCollideWorldBounds(true);

    this.raqueta.body.setImmovable(true);
    this.raqueta.body.setCollideWorldBounds(true);

    this.physics.add.collider(this.pelota, this.raqueta, this.rebotePelota.bind(this));

    // Crear rejilla de bloques tipo ladrillos
    this.bloques = [];
    const filas = 4;        // cantidad de filas
    const columnas = 7;     // cantidad de columnas
    const anchoBloque = 200;
    const altoBloque = 50;
    const separacion = 10;  // espacio entre bloques
    const offsetX = 100;    // margen desde la izquierda
    const offsetY = 100;    // margen desde arriba

    for (let fila = 0; fila < filas; fila++) {
      for (let col = 0; col < columnas; col++) {
        const x = offsetX + col * (anchoBloque + separacion) + anchoBloque / 2;
        const y = offsetY + fila * (altoBloque + separacion) + altoBloque / 2;

        const bloque = this.add.rectangle(x, y, anchoBloque, altoBloque, 0x0000ff);
        this.physics.add.existing(bloque);
        bloque.body.setImmovable(true);
        this.bloques.push(bloque);

        this.physics.add.collider(this.pelota, bloque, () => {
          bloque.destroy(); // Destruye el bloque al golpearlo
        });
      }
    }

    this.teclaLanzar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    this.moverRaqueta();

    if (this.pelotaEnEspera) {
      this.posicionarPelota();
    }

    if (this.pelota.y > this.cameras.main.height + 200) {
      this.pelotaEnEspera = true;
      this.pelota.body.setVelocity(0, 0);
    }
  }

  moverRaqueta() {
    this.raqueta.body.setVelocity(0);
    if (this.controles.left.isDown || this.teclasExtra.A.isDown) {
      this.raqueta.body.setVelocityX(-this.velocidadRaqueta);
    }
    if (this.controles.right.isDown || this.teclasExtra.D.isDown) {
      this.raqueta.body.setVelocityX(this.velocidadRaqueta);
    }
  }

  posicionarPelota() {
    if (Phaser.Input.Keyboard.JustDown(this.teclaLanzar)) {
      this.pelotaEnEspera = false;

      let direccionX = 0;
      if (this.raqueta.body.velocity.x > 0) direccionX = 1;
      else if (this.raqueta.body.velocity.x < 0) direccionX = -1;
      else direccionX = Phaser.Math.FloatBetween(-1, 1).toFixed(1);

      const magnitud = Math.sqrt(direccionX * direccionX + 1);
      const velX = (direccionX / magnitud) * this.velocidadPelota;
      const velY = (-1 / magnitud) * this.velocidadPelota;
      this.pelota.body.setVelocity(velX, velY);

      return;
    }

    this.pelota.y = this.raqueta.y - this.raqueta.height / 2 - this.pelota.radius - 20;

    const atraccion = (this.raqueta.x - this.pelota.x) * 0.05;
    const friccion = this.inerciaBola * 0.2;

    this.inerciaBola += atraccion - friccion;
    this.pelota.x += this.inerciaBola;

    this.pelota.x = Phaser.Math.Clamp(this.pelota.x, this.raqueta.x - this.raqueta.width / 2, this.raqueta.x + this.raqueta.width / 2);
  }

  rebotePelota() {
    const diferencia = this.pelota.x - this.raqueta.x;
    let direccionX = Phaser.Math.Clamp(diferencia * 0.007, -1, 1);
    const magnitud = Math.sqrt(direccionX * direccionX + 1);
    const velX = (direccionX / magnitud) * this.velocidadPelota;
    const velY = (-1 / magnitud) * this.velocidadPelota;
    this.pelota.body.setVelocity(velX, velY);
  }
}
