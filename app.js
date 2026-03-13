const FLIGHT_KEY = 'hawaii_flights'
const CAR_KEY = 'hawaii_cars'
const HOTEL_KEY = 'hawaii_hotels'
const FLIGHT_THUMB = 'assets/flight.svg'
const CAR_THUMB = 'assets/car.svg'
const HOTEL_THUMB = 'assets/hotel.svg'

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

function save(key, arr){ localStorage.setItem(key, JSON.stringify(arr)) }
function load(key){ try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return []} }

function renderFlights(){
  const list = document.getElementById('flight-list')
  list.innerHTML = ''
  const items = load(FLIGHT_KEY)
  items.forEach(f => {
    const li = document.createElement('li')
    const img = document.createElement('img')
    img.className = 'thumb'
    img.src = FLIGHT_THUMB
    const leftWrap = document.createElement('div')
    leftWrap.className = 'item-left'
    const left = document.createElement('div')
    left.innerHTML = `<strong>${escapeHtml(f.passenger||'')} — ${escapeHtml(f.airline)} ${escapeHtml(f.flightNumber)}${f.flightConf? ' (Conf: '+escapeHtml(f.flightConf)+')':''}</strong><div class="meta"><span class=\"time-label\">Dep:</span> ${escapeHtml(f.depAirport)} ${formatDT(f.depTime)} &nbsp;→&nbsp; <span class=\"time-label\">Arr:</span> ${escapeHtml(f.arrAirport)} ${formatDT(f.arrTime)}</div>`
    leftWrap.appendChild(img)
    leftWrap.appendChild(left)
    const right = document.createElement('div')
    const edit = document.createElement('button')
    edit.className='small-btn'
    edit.textContent='Edit'
    edit.onclick = ()=>{ editItem('flight', f.id) }
    const del = document.createElement('button')
    del.className='small-btn'
    del.textContent='Delete'
    del.onclick = ()=>{ removeItem(FLIGHT_KEY,f.id); renderAll() }
    right.appendChild(edit)
    right.appendChild(del)
    li.appendChild(leftWrap)
    li.appendChild(right)
    list.appendChild(li)
  })
}

function renderCars(){
  const list = document.getElementById('car-list')
  list.innerHTML = ''
  const items = load(CAR_KEY)
  items.forEach(c => {
    const li = document.createElement('li')
    const img = document.createElement('img')
    img.className='thumb'
    img.src = CAR_THUMB
    const leftWrap = document.createElement('div')
    leftWrap.className='item-left'
    const left = document.createElement('div')
    left.innerHTML = `<strong>${escapeHtml(c.passenger||'')} — ${escapeHtml(c.company)}${c.confNumber? ' (Conf: '+escapeHtml(c.confNumber)+')':''}</strong><div class="meta">${escapeHtml(c.pickupLoc)} (${formatDT(c.pickupTime)}) → ${escapeHtml(c.dropoffLoc)} (${formatDT(c.dropoffTime)})</div>`
    leftWrap.appendChild(img)
    leftWrap.appendChild(left)
    const right = document.createElement('div')
    const edit = document.createElement('button')
    edit.className='small-btn'
    edit.textContent='Edit'
    edit.onclick = ()=>{ editItem('car', c.id) }
    const del = document.createElement('button')
    del.className='small-btn'
    del.textContent='Delete'
    del.onclick = ()=>{ removeItem(CAR_KEY,c.id); renderAll() }
    right.appendChild(edit)
    right.appendChild(del)
    li.appendChild(leftWrap)
    li.appendChild(right)
    list.appendChild(li)
  })
}

function renderHotels(){
  const list = document.getElementById('hotel-list')
  list.innerHTML = ''
  const items = load(HOTEL_KEY)
  items.forEach(h => {
    const li = document.createElement('li')
    const img = document.createElement('img')
    img.className='thumb'
    img.src = HOTEL_THUMB
    const leftWrap = document.createElement('div')
    leftWrap.className='item-left'
    const left = document.createElement('div')
    left.innerHTML = `<strong>${escapeHtml(h.passenger||'')} — ${escapeHtml(h.hotel)}${h.hotelConf? ' (Conf: '+escapeHtml(h.hotelConf)+')':''}</strong><div class="meta">${escapeHtml(h.location||'')} | ${formatDT(h.checkIn)} → ${formatDT(h.checkOut)}</div>`
    leftWrap.appendChild(img)
    leftWrap.appendChild(left)
    const right = document.createElement('div')
    const edit = document.createElement('button')
    edit.className='small-btn'
    edit.textContent='Edit'
    edit.onclick = ()=>{ editItem('hotel', h.id) }
    const del = document.createElement('button')
    del.className='small-btn'
    del.textContent='Delete'
    del.onclick = ()=>{ removeItem(HOTEL_KEY,h.id); renderAll() }
    right.appendChild(edit)
    right.appendChild(del)
    li.appendChild(leftWrap)
    li.appendChild(right)
    list.appendChild(li)
  })
}

const ORDER_KEY = 'hawaii_passenger_order'

function loadOrder(){
  try{return JSON.parse(localStorage.getItem(ORDER_KEY)||'[]')}catch(e){return []}
}
function saveOrder(arr){ localStorage.setItem(ORDER_KEY, JSON.stringify(arr)) }
function ensureOrderIncludes(name){
  if(!name) return
  const ord = loadOrder()
  if(!ord.includes(name)){
    ord.push(name)
    saveOrder(ord)
  }
}
function removeFromOrder(name){
  if(!name) return
  const ord = loadOrder().filter(x=>x!==name)
  saveOrder(ord)
}
function reorderPassengers(dragged, target){
  const ord = loadOrder()
  const idxDrag = ord.indexOf(dragged)
  const idxTarget = ord.indexOf(target)
  if(idxDrag===-1 || idxTarget===-1) return
  ord.splice(idxDrag,1)
  const insertIdx = ord.indexOf(target)
  ord.splice(insertIdx,0,dragged)
  saveOrder(ord)
}

function renderDashboard(){
  const container = document.getElementById('dashboard')
  if(!container) return
  container.innerHTML = ''
  const flights = load(FLIGHT_KEY)
  const cars = load(CAR_KEY)
  const hotels = load(HOTEL_KEY)

  // collect passenger names
  const names = new Set()
  flights.forEach(f=> names.add((f.passenger||'').trim()))
  cars.forEach(c=> names.add((c.passenger||'').trim()))
  hotels.forEach(h=> names.add((h.passenger||'').trim()))

  // update order storage by removing missing names and adding new ones
  const existing = Array.from(names).filter(n=>n!=='')
  let ord = loadOrder()
  ord = ord.filter(n=> existing.includes(n))
  existing.forEach(n=>{ if(!ord.includes(n)) ord.push(n) })
  saveOrder(ord)

  const nameList = ord.slice()
  if(nameList.length===0){
    container.innerHTML = '<div class="no-data">No passenger data yet. Add flights, cars, or hotels.</div>'
    return
  }

  nameList.forEach(name=>{
    const card = document.createElement('div')
    card.className = 'passenger-card'
    card.draggable = true
    card.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('text/plain', name)
    })
    card.addEventListener('dragover', e=>{ e.preventDefault(); card.classList.add('drag-over') })
    card.addEventListener('dragleave', e=>{ card.classList.remove('drag-over') })
    card.addEventListener('drop', e=>{
      e.preventDefault(); card.classList.remove('drag-over')
      const dragged = e.dataTransfer.getData('text/plain')
      reorderPassengers(dragged, name)
      renderDashboard()
    })

    const fFor = flights.filter(f=> (f.passenger||'').trim()===name)
    const cFor = cars.filter(c=> (c.passenger||'').trim()===name)
    const hFor = hotels.filter(h=> (h.passenger||'').trim()===name)

    // header with avatar and badges
    const header = document.createElement('div'); header.className='card-header'
    const avatar = document.createElement('div'); avatar.className='avatar'
    const initials = name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
    avatar.textContent = initials || '?'
    const titleWrap = document.createElement('div'); titleWrap.className='card-title'
    const title = document.createElement('h4'); title.textContent = name
    titleWrap.appendChild(title)
    const badges = document.createElement('div'); badges.className='badges'
    const b1 = document.createElement('div'); b1.className='badge'; b1.textContent = `${fFor.length} Flights`
    const b2 = document.createElement('div'); b2.className='badge'; b2.textContent = `${cFor.length} Cars`
    const b3 = document.createElement('div'); b3.className='badge'; b3.textContent = `${hFor.length} Hotels`
    badges.appendChild(b1); badges.appendChild(b2); badges.appendChild(b3)
    header.appendChild(avatar); header.appendChild(titleWrap); header.appendChild(badges)
    card.appendChild(header)

    const makeSection = (label, items, key)=>{
      const sec = document.createElement('div')
      const h = document.createElement('div')
      h.className = 'section-title section-'+key
      if(key==='flight'){
        const icon = document.createElement('span')
        icon.className = 'section-icon'
        icon.textContent = '✈️'
        h.appendChild(icon)
      }
      h.appendChild(document.createTextNode(label))
      sec.appendChild(h)
      if(items.length===0){
        const p = document.createElement('div'); p.className='no-data'; p.textContent='None'
        sec.appendChild(p)
        return sec
      }
      const ul = document.createElement('ul'); ul.className='sublist'
      items.forEach(it=>{
        const li = document.createElement('li')
        const leftWrap = document.createElement('div')
        leftWrap.className = 'item-left'
        const content = document.createElement('div')
        if(key==='flight'){
          content.innerHTML = `${it.airline} ${it.flightNumber}${it.flightConf? ' (Conf: '+it.flightConf+')':''} — <strong>Dep</strong> ${it.depAirport} ${formatDT(it.depTime)} → <strong>Arr</strong> ${it.arrAirport} ${formatDT(it.arrTime)}`
        } else {
          const img = document.createElement('img')
          img.className = 'thumb'
          img.src = key==='car' ? CAR_THUMB : HOTEL_THUMB
          leftWrap.appendChild(img)
          content.textContent = key==='car' ? `${it.company}${it.confNumber? ' (Conf: '+it.confNumber+')':''} — ${it.pickupLoc}→${it.dropoffLoc} @ ${formatDT(it.pickupTime)}` : `${it.hotel}${it.hotelConf? ' (Conf: '+it.hotelConf+')':''} — ${it.location||''} ${formatDT(it.checkIn)}→${formatDT(it.checkOut)}`
        }
        leftWrap.appendChild(content)
        const right = document.createElement('div')
        const edit = document.createElement('button')
        edit.className='small-btn'
        edit.textContent='Edit'
        edit.onclick = ()=>{ editItem(key, it.id) }
        const del = document.createElement('button')
        del.className='small-btn'
        del.textContent='Delete'
        del.onclick = ()=>{ removeItem(key==='flight'?FLIGHT_KEY: key==='car'?CAR_KEY:HOTEL_KEY, it.id); renderAll() }
        right.appendChild(edit)
        right.appendChild(del)
        li.appendChild(leftWrap)
        li.appendChild(right)
        ul.appendChild(li)
      })
      sec.appendChild(ul)
      return sec
    }

    card.appendChild(makeSection('Flights', fFor, 'flight'))
    card.appendChild(makeSection('Cars', cFor, 'car'))
    card.appendChild(makeSection('Hotels', hFor, 'hotel'))
    container.appendChild(card)
  })
}

function renderAll(){ renderFlights(); renderCars(); renderHotels(); renderDashboard() }

function removeItem(key,id){
  const items = load(key).filter(i=>i.id!==id)
  save(key,items)
}

function getAllData(){
  return {
    flights: load(FLIGHT_KEY),
    cars: load(CAR_KEY),
    hotels: load(HOTEL_KEY),
    passengerOrder: loadOrder(),
  }
}

function setAllData(payload){
  if(!payload || typeof payload !== 'object') return
  if(Array.isArray(payload.flights)) save(FLIGHT_KEY,payload.flights)
  if(Array.isArray(payload.cars)) save(CAR_KEY,payload.cars)
  if(Array.isArray(payload.hotels)) save(HOTEL_KEY,payload.hotels)
  if(Array.isArray(payload.passengerOrder)) saveOrder(payload.passengerOrder)
  renderAll()
}

function setupShareControls(){
  const exportBtn = document.getElementById('export-data')
  const importBtn = document.getElementById('import-data')
  const payloadField = document.getElementById('share-payload')

  if(exportBtn){
    exportBtn.addEventListener('click', ()=>{
      const data = getAllData()
      const json = JSON.stringify(data, null, 2)
      payloadField.value = json
      navigator.clipboard.writeText(json).catch(()=>{})
      alert('Exported JSON to textarea (and clipboard when available).')
    })
  }

  if(importBtn){
    importBtn.addEventListener('click', ()=>{
      let text = payloadField.value.trim()
      if(!text){
        alert('Paste JSON in the textarea first.')
        return
      }
      try{
        const payload = JSON.parse(text)
        setAllData(payload)
        alert('Data imported successfully.')
      }catch(e){
        alert('Invalid JSON: ' + e.message)
      }
    })
  }

  const printBtn = document.getElementById('print-data')
  if(printBtn){
    printBtn.addEventListener('click', ()=>{
      window.print()
    })
  }
}

function formatDT(v){ if(!v) return ''
  try{ const d = new Date(v); return d.toLocaleString() }catch(e){return v}
}

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c])
}

function setFormEditing(form, key, id, data){
  form.dataset.editingId = id
  const submitBtn = form.querySelector('button[type="submit"]')
  if(submitBtn) submitBtn.textContent = 'Save'
  // add cancel button if not present
  if(!form.querySelector('.cancel-edit')){
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.className = 'small-btn cancel-edit'
    cancel.textContent = 'Cancel'
    cancel.onclick = ()=>{ clearFormEditing(form) }
    submitBtn.insertAdjacentElement('afterend', cancel)
  }
}

function clearFormEditing(form){
  delete form.dataset.editingId
  const submitBtn = form.querySelector('button[type="submit"]')
  if(submitBtn){
    // restore original label
    if(form.id==='flight-form') submitBtn.textContent = 'Add Flight'
    if(form.id==='car-form') submitBtn.textContent = 'Add Car Reservation'
    if(form.id==='hotel-form') submitBtn.textContent = 'Add Hotel Reservation'
  }
  const cancel = form.querySelector('.cancel-edit')
  if(cancel) cancel.remove()
  form.reset()
}

function editItem(type, id){
  if(type==='flight'){
    const items = load(FLIGHT_KEY)
    const it = items.find(x=>x.id===id)
    if(!it) return
    const form = document.getElementById('flight-form')
    // populate
    form.elements['passenger'].value = it.passenger||''
    form.elements['airline'].value = it.airline||''
    form.elements['flightNumber'].value = it.flightNumber||''
    form.elements['flightConf'].value = it.flightConf||''
    form.elements['depAirport'].value = it.depAirport||''
    form.elements['arrAirport'].value = it.arrAirport||''
    form.elements['depTime'].value = it.depTime||''
    form.elements['arrTime'].value = it.arrTime||''
    setFormEditing(form,'flight',id,it)
    form.scrollIntoView({behavior:'smooth',block:'center'})
  }
  if(type==='car'){
    const items = load(CAR_KEY)
    const it = items.find(x=>x.id===id)
    if(!it) return
    const form = document.getElementById('car-form')
    form.elements['passenger'].value = it.passenger||''
    form.elements['company'].value = it.company||''
    form.elements['confNumber'].value = it.confNumber||''
    form.elements['pickupLoc'].value = it.pickupLoc||''
    form.elements['dropoffLoc'].value = it.dropoffLoc||''
    form.elements['pickupTime'].value = it.pickupTime||''
    form.elements['dropoffTime'].value = it.dropoffTime||''
    setFormEditing(form,'car',id,it)
    form.scrollIntoView({behavior:'smooth',block:'center'})
  }
  if(type==='hotel'){
    const items = load(HOTEL_KEY)
    const it = items.find(x=>x.id===id)
    if(!it) return
    const form = document.getElementById('hotel-form')
    form.elements['passenger'].value = it.passenger||''
    form.elements['hotel'].value = it.hotel||''
    form.elements['hotelConf'].value = it.hotelConf||''
    form.elements['location'].value = it.location||''
    form.elements['checkIn'].value = it.checkIn||''
    form.elements['checkOut'].value = it.checkOut||''
    setFormEditing(form,'hotel',id,it)
    form.scrollIntoView({behavior:'smooth',block:'center'})
  }
}

document.getElementById('flight-form').addEventListener('submit', e=>{
  e.preventDefault()
  const form = e.target
  const f = Object.fromEntries(new FormData(form).entries())
  const items = load(FLIGHT_KEY)
  if(form.dataset.editingId){
    const id = form.dataset.editingId
    const updated = items.map(it=> it.id===id ? {...f, id} : it)
    save(FLIGHT_KEY, updated)
    clearFormEditing(form)
  } else {
    items.push({...f, id: uid()})
    save(FLIGHT_KEY, items)
    form.reset()
  }
  renderAll()
})

document.getElementById('car-form').addEventListener('submit', e=>{
  e.preventDefault()
  const form = e.target
  const f = Object.fromEntries(new FormData(form).entries())
  const items = load(CAR_KEY)
  if(form.dataset.editingId){
    const id = form.dataset.editingId
    const updated = items.map(it=> it.id===id ? {...f, id} : it)
    save(CAR_KEY, updated)
    clearFormEditing(form)
  } else {
    items.push({...f, id: uid()})
    save(CAR_KEY, items)
    form.reset()
  }
  renderAll()
})

document.getElementById('hotel-form').addEventListener('submit', e=>{
  e.preventDefault()
  const form = e.target
  const f = Object.fromEntries(new FormData(form).entries())
  const items = load(HOTEL_KEY)
  if(form.dataset.editingId){
    const id = form.dataset.editingId
    const updated = items.map(it=> it.id===id ? {...f, id} : it)
    save(HOTEL_KEY, updated)
    clearFormEditing(form)
  } else {
    items.push({...f, id: uid()})
    save(HOTEL_KEY, items)
    form.reset()
  }
  renderAll()
})

// initial render
renderAll()
setupShareControls()
