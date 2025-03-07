// group1.dart
import 'package:flutter/material.dart';
import 'size_config.dart';

class Group1 extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController busNoController;
  final VoidCallback onNextPressed;

  const Group1({
    Key? key,
    required this.nameController,
    required this.busNoController,
    required this.onNextPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextFormField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: "Name",
            hintText: "Enter your Name",
            floatingLabelBehavior: FloatingLabelBehavior.always,
            suffixIcon: Padding(
              padding: EdgeInsets.all(20),
              child: Icon(Icons.account_box),
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your name';
            }
            return null;
          },
        ),
        SizedBox(
          height: getProportionateScreenHeight(20),
        ),
        TextFormField(
          controller: busNoController,
          decoration: const InputDecoration(
            labelText: "Bus no",
            hintText: "Enter your Bus no",
            floatingLabelBehavior: FloatingLabelBehavior.always,
            suffixIcon: Padding(
              padding: EdgeInsets.all(20),
              child: Icon(Icons.directions_bus),
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter your bus number';
            }
            return null;
          },
        ),
        SizedBox(
          height: getProportionateScreenHeight(20),
        ),
        SizedBox(
          width: double.infinity,
          height: getProportionateScreenHeight(56),
          child: TextButton(
            style: TextButton.styleFrom(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              foregroundColor: Colors.white,
              backgroundColor: Colors.black,
            ),
            onPressed: onNextPressed,
            child: Text(
              "Next",
              style: TextStyle(
                fontSize: getProportionateScreenWidth(18),
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }
}