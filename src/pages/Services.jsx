import React from 'react'

const items = [
  ['Bâche','/image/Bache.jpeg','Bâche'],
  ['Chaise','/image/chaisevip.jpg','Chaise'],
  ['Assiette creuse','/image/assiettecreuse.jpeg','Assiette creuse'],
  ['Assiette plate','/image/assietteplate.jpeg','Assiette plate'],
  ['Cuillère à soupe','/image/cuillere-a-soupe.jpg','Cuillère à soupe'],
  ['Fourchette','/image/fourchette.jpg','Fourchette'],
  ['Couteau','/image/couteau-table.jpg','Couteau'],
  ['Verre à eau','/image/verre-a-eau.jpg','Verre à eau'],
  ['Verre à vin','/image/verres-a-vin.jpg','Verre à vin'],
  ['Tréteau','/image/treteau.jpg','Tréteau'],
  ['Sono','/image/sono.jpg','Sono'],
  ['Fût','/image/fut.jpg','Fût']
]

export default function Services(){
  return (
    <section id="Service">
      <h1>Nos Services</h1>
      <ul className="liste-services-en-image">
        {items.map(([name, src, alt]) => (
          <li key={name}>
            <img src={src} alt={alt} />
            {name}
          </li>
        ))}
      </ul>
    </section>
  )
}
