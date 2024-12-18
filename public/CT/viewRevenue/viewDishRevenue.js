// new Vue({
//     el: '#app',
//     data() {
//         return {
//             type: 'day',   // Default value
//             sortType: 'ASC',
//             date: '',       // Default value for date
//             month: '',      // Default value for month
//             year: '',       // Default value for year
//             page: 1,        // Current page
//             totalPages: 1,  // Total pages for pagination
//         };
//     },
//     methods: {
//         changeType() {
//             // Handle type change and reset date, month, or year if necessary
//             if (this.type === 'day') {
//                 this.date = '';
//             } else if (this.type === 'month') {
//                 this.month = '';
//             } else if (this.type === 'year') {
//                 this.year = '';
//             }
//         },
//         changeSortType() {
//             this.fetchRevenueData();  // Call to fetch data after sort type change
//         },
//         changePage(page) {
//             this.page = page;
//             this.fetchRevenueData();  // Call to fetch data on page change
//         },
//         submitForm() {
//             // Construct the query parameters based on the selected values
//             let queryParams = `?type=${this.type}&sortType=${this.sortType}&page=${this.page}`;

//             // Add date, month, or year based on the selected type
//             if (this.type === 'day' && this.date) {
//                 queryParams += `&date=${this.date}`;
//             } else if (this.type === 'month' && this.month) {
//                 queryParams += `&month=${this.month}`;
//             } else if (this.type === 'year' && this.year) {
//                 queryParams += `&year=${this.year}`;
//             }

//             // Navigate to the new page with the query parameters
//             window.location.href = '/dish' + queryParams;
//         }
//     }
// });

const app = Vue({
    el: "#app",
    data() {
        return {
            type: "year",        // Default revenue type
            Date: "2024-01-07",  // Default date for day
            month: 1,            // Default month
            year: 2024,          // Default year
            sortType: "ASC",     // Default sort type
            page: 1,             // Default page
            pageSize: 10,        // Default page size
            dishes: dishes || [] // Preloaded dishes from server
        };
    },
    methods: {
        async fetchRevenue() {
            try {
                // Prepare query string for GET request
                const queryParams = new URLSearchParams({
                    type: this.type,
                    Date: this.Date,
                    month: this.month,
                    year: this.year,
                    sortType: this.sortType,
                    page: this.page,
                    pageSize: this.pageSize
                }).toString();

                // Fetch data from server
                const response = await axios.get(`/company/revenue/dish?${queryParams}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch revenue data');
                }

                const data = await response.json();
                this.dishes = data;
            } catch (error) {
                console.error('Error fetching revenue data:', error);
            }
        }
    }
});

