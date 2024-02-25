import { useEffect, useState } from 'react'

function App() {
    const [books, setBooks] = useState<{bookId: string,bookName: string; author: string; price: string; genre: string; rating: string }[]>([]);
    const [bookId] = useState<string>('');
    const [bookName, setBookName] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [genre, setGenre] = useState<string>('');
    const [rating, setRating] = useState<string>('');

    const syncUsers = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/Bookstore`, {
            mode: 'no-cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
            }});
        const body = await res.json() as { bookId: string, bookName: string; author: string; price: string; genre: string; rating: string }[];

        setBooks(body);
    }


    useEffect(() => {
        void syncUsers();
    }, [])

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await fetch(`${import.meta.env.VITE_API_URL}/usersData`, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({bookId, bookName, author, price, genre, rating  }),
        });
        setBooks([...books, {bookId, bookName, author, price, genre, rating  }]);
        await syncUsers();
    }

    return (
        <div>
            <div>
                <h1>Users</h1>
                <form onSubmit={onFormSubmit}>
                    <input
                        type="text"
                        name="bookName"
                        value={bookName}
                        onChange={(e) => setBookName(e.target.value)}
                        placeholder="Book Name"
                    />
                    <input
                        type="text"
                        name="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Author"
                    />
                    <input
                        type="text"
                        name="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Price"
                    />
                    <input
                        type="text"
                        name="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="Genre"
                    />
                    <input
                        type="text"
                        name="rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="Rating"
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>
            <table>
                <thead>
                <tr>
                    <th>Book Name</th>
                    <th>Author</th>
                    <th>Price</th>
                    <th>Genre</th>
                    <th>Rating</th>
                </tr>
                </thead>
                <tbody>
                {books.map(({bookId, bookName, author, price, genre, rating }) => (
                    <tr key={bookId}>
                        <td>{bookName}</td>
                        <td>{author}</td>
                        <td>{price}</td>
                        <td>{genre}</td>
                        <td>{rating}</td>
                        <td>{bookId}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

    )
}

export default App