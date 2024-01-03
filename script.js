var noteCounter = 0;
var container = document.querySelector('.container');

// Abrir una conexión a IndexedDB
var db;
var openRequest = indexedDB.open('notesDB', 1);

openRequest.onupgradeneeded = function (e) {
  var db = e.target.result;
  if (!db.objectStoreNames.contains('notes')) {
    db.createObjectStore('notes', { keyPath: 'id' });
  }
};

openRequest.onsuccess = function (e) {
  var db = e.target.result;

  document.getElementById('addNote').addEventListener('click', function () {
    noteCounter++;
    var currentDate = new Date();
    var formattedDate = currentDate.toLocaleDateString() + ' ' + currentDate.toLocaleTimeString();
    var noteHTML = `
            <div class="note" data-note-id="${noteCounter}">
              <div class="note-title">
                Nota ${noteCounter}
                <button class="delete">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                  </svg>
                </button>
                
              </div>
              <div class="note-date">${formattedDate}</div>
              <div class="note-content">
                <textarea name="" id="note${noteCounter}" cols="30" rows="10"></textarea>
              </div>
            </div>
          `;
    // Crear el div de la nota
    var noteNode = document.createElement('div');
    noteNode.innerHTML = noteHTML;
    container.appendChild(noteNode);

    // Obtener el textarea
    var textarea = document.getElementById(`note${noteCounter}`);

    // Guardar el contenido del textarea cada vez que cambia
    textarea.addEventListener('input', function () {
      var transaction = db.transaction(['notes'], 'readwrite');
      var store = transaction.objectStore('notes');
      store.put({ id: noteCounter, content: textarea.value, date: formattedDate });
    });


    //boton de eliminar
    noteNode.querySelector('.delete').addEventListener('click', function () {
      noteNode.parentNode.removeChild(noteNode);

      // Eliminar la nota de IndexedDB
      var transaction = db.transaction(['notes'], 'readwrite');
      var store = transaction.objectStore('notes');
      store.delete(noteCounter);
    });
  });

  document.getElementById('deleteAllNotes').addEventListener('click', function () {
    // Elimina todas las notas
    var notes = document.querySelectorAll('.note');
    notes.forEach(function (note) {
      note.parentNode.removeChild(note);
    });
    // Reinicia el contador de notas
    noteCounter = 0;

    // Eliminar todas las notas de IndexedDB
    var transaction = db.transaction(['notes'], 'readwrite');
    var store = transaction.objectStore('notes');
    store.clear();
  });

  window.addEventListener('load', function () {
    var transaction = db.transaction(['notes'], 'readonly');
    var store = transaction.objectStore('notes');
    var request = store.openCursor();

    request.onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        var noteHTML = `
          <div class="note" data-note-id="${cursor.value.id}">
            <div class="note-title">
              Nota ${cursor.value.id}
              <button class="delete">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                  </svg>
                </button>
            </div>
            <div class="note-date">${cursor.value.date}</div>
            <div class="note-content">
              <textarea name="" id="note${cursor.value.id}" cols="30" rows="10">${cursor.value.content}</textarea>
            </div>
          </div>
        `;

        container.innerHTML += noteHTML;

        // Adjuntar el evento de clic del botón de eliminar
        var noteNode = document.querySelector(`[data-note-id="${cursor.value.id}"]`);
        noteNode.querySelector('.delete').addEventListener('click', function () {
          noteNode.parentNode.removeChild(noteNode);

          // Eliminar la nota de IndexedDB
          var transaction = db.transaction(['notes'], 'readwrite');
          var store = transaction.objectStore('notes');
          store.delete(cursor.value.id);
        });

        cursor.continue();
      }
    };
  });
};
