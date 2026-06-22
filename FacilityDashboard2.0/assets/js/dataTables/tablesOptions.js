$(".dataTable").DataTable({
  paging: true,
  ordering: true,
  select: false,
  filter: true,
  searching: false,
  layout: {
    topStart: null,
    topEnd: null,
    bottomStart: null,
    bottomEnd: null,
    bottom: ["pageLength", "info", "paging"],
  },

  lengthMenu: [1,10, 25, 50, 100, { label: 'All', value: -1 }],
  language: {
    entries: {
        _: 'Rows',
        1: 'Page'
    }
},

});

/*/*/
$(".no-ordering").DataTable({
  paging: true,
  ordering: false,
  select: false,
  filter: true,
  searching: false,
  layout: {
    topStart: null,
    topEnd: null,
    bottomStart: null,
    bottomEnd: null,
    bottom: ["pageLength", "info", "paging"],
  },

  lengthMenu: [1,10, 25, 50, 100, { label: 'All', value: -1 }],
  language: {
    entries: {
        _: 'Rows',
        1: 'Page'
    }
},
});


/*/*/
 
$(".TableFixedHeight").DataTable({
  scrollY: "21.5rem",
  paging: false,
  select: false,
  filter: false,
  ordering: false,
  searching: false,
  layout: {
    topStart: null,
    topEnd: null,
    bottomStart: null,
    bottomEnd: null,
    bottom: null,
  },
});

/*/*/


