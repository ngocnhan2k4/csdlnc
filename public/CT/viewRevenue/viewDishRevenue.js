const app = new Vue({
    el: '#app',
    data: {
        type: 'year',
        date: '2024-01-07',
        month: 1,
        year: 2024,
    },
    methods: {
        submitQuery() {
            // Giá trị mặc định
            const sortType = this.sortType;
            const defaultPageSize = 10;
            const defaultPage = 1;

            let query = `sortType=${sortType}&page=${defaultPage}&pageSize=${defaultPageSize}`;
            if(this.branch === 'all') {
                query += `&branch=0`;
            } else{
                query += `&branch=${this.branch}`;
            }

            // Xây dựng các query parameters dựa trên type
            if (this.type === 'day') {
                query += `&Date=${this.date}`;
            } else if (this.type === 'month') {
                query += `&month=${this.month}&year=${this.year}`;
            } else if (this.type === 'year') {
                query += `&year=${this.year}`;
            }

            console.log(query);
            // Chuyển hướng đến endpoint phù hợp
            window.location.href = `/company/revenue/dish/${this.type}?${query}`;
        }

    },
});