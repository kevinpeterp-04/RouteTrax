import 'package:flutter/material.dart';
import 'aboutus.dart';
class StatusScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Status"),
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
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.all(8.0),
                child: TextField(
                  expands: true,
                  maxLines: null,
                  decoration: InputDecoration(
                    hintText: 'Enter Status',
                    border: InputBorder.none,
                  ),
                  textAlignVertical: TextAlignVertical.top, // Align text to the top
                ),
              ),
            ),
            SizedBox(height: 10), // Adds spacing between TextField and Button
            Align(
              alignment: Alignment.centerLeft, // Align button to the left
              child: TextButton(
                onPressed: () {
                  // Handle status submission here
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
            Expanded(
              flex: 3, // Remaining space to keep layout balanced
              child: Container(), // Empty container to take up remaining space
            ),
          ],
        ),
      ),
    );
  }
}
