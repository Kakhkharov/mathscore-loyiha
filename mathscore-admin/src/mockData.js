export const initialCourses = [
  {
    id: 1,
    title: "SAT Mathematics Intensive",
    category: "SAT Prep",
    price: 600000,
    studentsCount: 384,
    rating: 4.8,
    status: "Active",
    lessonsCount: 24,
    instructor: "Malika Opa",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDml4tLNvySCO_8Sk5xl-mjsjhz_Ej0cqH5cHeg56Ubt-Sm8Pb7RaEXyE_QJfIlAxjKq4MaZGzrY3eO141r3AhrdP1OuulE35nT1PKttbDY_Rv7phjufab0qv_R9MDZ5vEOYjS2L6SUM9t4_zUqnW2zBjCJ75A8tEwyE8BonYWKIwircoAZ54nUSrDMuwcFkz0t59CYPzNojT7fvfsKCGrudiTQcaImh7ACT_kRWUBGhRrBhdBf3L4qePh5wotnQNm497SH1cpiDVKY",
    curriculum: [
      { id: 1, title: "Heart of Algebra: Linear Equations", duration: "45 min" },
      { id: 2, title: "Problem Solving and Data Analysis", duration: "50 min" },
      { id: 3, title: "Passport to Advanced Math", duration: "60 min" }
    ]
  },
  {
    id: 2,
    title: "A-Level Pure Math & Mechanics",
    category: "A-Level",
    price: 700000,
    studentsCount: 290,
    rating: 4.9,
    status: "Active",
    lessonsCount: 32,
    instructor: "John Doe",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmlLTsBn2JqKAZIVyqo2XBzGZPQs4-pUQKDhyXtXeTNzhznSy5M4KqKpuO6UqUlwqqSnzGWsP4r9UybYlr__glDn7aoO996-b_ZZxGcqPihBpEBBGb7idSRAOkGYD5xzYsddWGfl17ILVxnprJ1L0vc8q1l_ZlSlHB7d_WUGj-iFTinYzaGQGi_RiLViqNOiq1QieA_fwI7WD_dBeRAQRcNpBgovT4f_ENRa7Iedgja1pnQ_BRaOMyE8qoBUeKCEmLW7nVrx65ZP1i",
    curriculum: [
      { id: 1, title: "Quadratic Functions & Graphs", duration: "40 min" },
      { id: 2, title: "Differentiation & Integration Asoslari", duration: "55 min" },
      { id: 3, title: "Mechanics: Forces & Newton's Laws", duration: "48 min" }
    ]
  },
  {
    id: 3,
    title: "Mathematics Foundation",
    category: "Foundation",
    price: 500000,
    studentsCount: 450,
    rating: 4.7,
    status: "Active",
    lessonsCount: 18,
    instructor: "Sardor Azimov",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-jfwMWlV2Z7MU1wgHOVMAyNVwULA6sO57ip8zSt13Xus0ItU4d72lDf_GPn-aUzR11GPcvNgulQWL1rB57YX2n6ALDqTO9fotxU3XbPYV82cyUJjnollL8oNqjoqnnOuee-oQWUGObCfNJ6_w-okXyOWgF1xcuXRK3EbBLQTfYW7knIY6MvLRVxJd49DPF_82aU6d-4j76OUfF9L9MZeMzm8SgXzgcWI5qZkQ5vyWfFeBwAyAPbtEET6OluJ_aOrcZeqWwu6gxl-D",
    curriculum: [
      { id: 1, title: "Arifmetika va Sonlar Nazariyasi", duration: "35 min" },
      { id: 2, title: "Oddiy Kasrlar va Foizlar", duration: "40 min" }
    ]
  }
];

export const initialStudents = [
  { id: 1, name: "Malika Rasulova", email: "malika@gmail.com", course: "SAT Mathematics Intensive", status: "Online", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHofU2xpni0FdmxZ_nFQwe6fvpixYJ5_9kulirz--v4ToK-ksN4yQUoAoHgOIoJg3hHJoryfYxDZUXq8q1IqRjI6g5s3JR9Q6avgDad93EvPZdhshOgE9QYMFHTGP0shkYn1TszlEg0qxiOiguH939fmnOCByxl6CX0cBo2Pq09r2UuG4A0F9g17fzXgv5BPPZjSSPg8NL8Xk7kWw-skgeAaxwv8tqqrvW6Yh7aMILGhmLq2sK6AmcNxVQNxC0fI0hc64us21zC4Xf" },
  { id: 2, name: "Sardor Azimov", email: "sardor17@gmail.com", course: "Mathematics Foundation", status: "Offline", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9CmMWF0QXizezvb-YzdvQHkMOmhpICRNHW1UFhoON1gmAzLRE4oajgfNxlIEhFfCLdk8P67zwF0e0bE_0y0R5cd4wL7zq0h18IdPiFs6Dn43kk8pRq-QlWwdkrtCppkGQPnEq6JVmEQtM8lAGjz-aOPcTIf4sPxh6RZime5iIuOgLxJELWja9zkYxfe5atX7-zpYXuURD63Ms8Ypc7-Cnl0gpA4WYV4hz2NGZQYv520InEmFt82QskqfCxaTkZzKfvLjga4o8fkny" },
  { id: 3, name: "Elena Kim", email: "elena.k@gmail.com", course: "A-Level Pure Math & Mechanics", status: "Online", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvZwNsp1C2uSGfHLNccMRu4t9bsVfQ08TdeTxF-nJF3thdFX-CDvowKbjMb2A_N3U0rfsZmTDsvF_FPawGLD4VdaOsXaJF8dTRrW9v7gAHCipSIdoqvbHAtqjnU-73ar2sHddiTkMTQQnft06mKOI9v4L_vRsv1NPP44G-UH7E9lbSaEIaeKaEi0enIbAmuo_aGpqmtsDhDs5CtWT4QxXK-Td-CvHZ1TGZ81ka3kxvNWrxv499NRuiQeiYe8Xy9gjU1kCxj1IwVbaT" },
  { id: 4, name: "Javohir Toshboyev", email: "javohir@gmail.com", course: "SAT Mathematics Intensive", status: "Online", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjybOJEPBgvFZUqkcJmMmFKMEkfZY373i5d_no4hmnHReSQwPaRPUSGPucs2FNyclw94iarE7VFWcUrm53a-VnYWy6v3jJWPgzhMV3RTt46AHtryNc3mUNqJUjqZXeawcHwVVOmxQdvDHySOoWTcNkwwdsvgLjlLCaf-rGGYGV3m8obgT7fr7zifFPAgvqn0t7H6zrCi7Ri_pt50leAKcXLcWBbFk6T29H_kmuIGh1tEmjEU2jPPvdrHv5mpGrva0eI-bUYgHL2Xib" }
];

export const initialActivities = [
  { id: 1, type: "sale", content: "\"SAT Mathematics Intensive\" kursi sotib olindi", detail: "Anvar G'aniyev tomonidan", time: "12 daqiqa avval", amount: "+$45", border: "border-primary" },
  { id: 2, type: "instructor", content: "Yangi o'qituvchi ro'yxatdan o'tdi", detail: "Lola Karimova", time: "1 soat avval", status: "TASDIQLANDI", border: "border-emerald-500" },
  { id: 3, type: "review", content: "Kurs bo'yicha yangi besh yulduzli sharh qoldirildi", detail: "Algebra 101", time: "3 soat avval", rating: 5, border: "border-amber-500" }
];
