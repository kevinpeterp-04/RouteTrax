import 'package:flutter/material.dart';
import 'aboutus.dart';

class LostAndFoundScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Lost & Found"),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            tooltip: "About Us",
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AboutUsPage(),
                ),
              );
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Container(
              height: 150, // Set the desired height
              padding: const EdgeInsets.all(8.0), // Add padding inside
              child: TextField(
                expands: true,
                maxLines: null,
                decoration: InputDecoration(
                  hintText: 'Enter Lost & Found Details',
                  border: InputBorder.none,
                ),
                textAlignVertical: TextAlignVertical.top, // Align text to top
              ),
            ),
            SizedBox(height: 10), // Spacing between TextField and Button
            Align(
              alignment: Alignment.centerLeft, // Align button to the left
              child: TextButton(
                onPressed: () {
                  // Handle Lost & Found submission here
                },
                child: Text('Submit'),
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  foregroundColor: Colors.white,
                  backgroundColor: Colors.black,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
